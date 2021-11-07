import { authDirectiveTransformer } from '@/main/graphql/directives/auth-directive'
import { GraphQLSchema } from 'graphql'

const schemaDirectivesTransform = (schema: GraphQLSchema): GraphQLSchema => {
  const directives = [
    authDirectiveTransformer
  ]

  let newSchema: GraphQLSchema

  directives.forEach(directive => {
    newSchema = directive(schema)
  })

  return newSchema
}

export default schemaDirectivesTransform
