import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'
import { GraphQLSchema } from 'graphql'

import { makeAuthMiddleware } from '@/main/factories/middlewares'
import { ForbiddenError } from 'apollo-server-express'

export const authDirectiveTransformer = (schema: GraphQLSchema): GraphQLSchema => {
  return mapSchema(schema, {

    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, 'auth')

      if (authDirective) {
        const { resolve } = fieldConfig

        fieldConfig.resolve = async function (source, args, context, info) {
          const request = {
            accessToken: context?.req?.headers?.['x-access-token']
          }

          const httpResponse = await makeAuthMiddleware().handle(request)

          if (httpResponse.statusCode === 200) {
            Object.assign(context?.req, httpResponse.body)
            return resolve.call(this, source, args, context, info)
          }

          throw new ForbiddenError(httpResponse.body.message)
        }

        return fieldConfig
      }
    }
  })
}
