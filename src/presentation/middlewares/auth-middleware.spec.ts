import { AuthMiddleware } from './auth-middleware'
import { AccessDeniedError } from './../errors'
import { forbidden } from './../helpers/http/http-helper'

interface AuthMiddlewareTypes{
  authMiddleware: AuthMiddleware
}

const makeAuthMiddleware = (): AuthMiddlewareTypes => {
  const authMiddleware = new AuthMiddleware()

  return {
    authMiddleware

  }
}

describe('AUth Middleware', () => {
  test('Should return 403 if no x-acces-token  exists in headers ', async () => {
    const { authMiddleware } = makeAuthMiddleware()
    const httpResponse = await authMiddleware.handle({})

    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })
})
