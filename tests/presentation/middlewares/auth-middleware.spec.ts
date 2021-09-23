import { forbidden, ok, serverError } from '@/presentation/helpers'
import { LoadAccountByToken } from '@/domain/usecases'
import { AuthMiddleware } from '@/presentation/middlewares'
import { throwError } from '@/tests/domain/mocks'

import { AccessDeniedError } from '@/presentation/errors'
import { mockLoadAccountByToken } from '@/tests/presentation/mocks'

type AuthMiddlewareTypes = {
  authMiddleware: AuthMiddleware
  loadAccountByTokenStub: LoadAccountByToken
}

const mockRequest = (): AuthMiddleware.Request => ({
  accessToken: 'any_token'
})

const makeAuthMiddleware = (role?: string): AuthMiddlewareTypes => {
  const loadAccountByTokenStub = mockLoadAccountByToken()

  const authMiddleware = new AuthMiddleware(loadAccountByTokenStub, role)

  return {
    authMiddleware,
    loadAccountByTokenStub
  }
}

describe('Auth Middleware', () => {
  test('Should return 403 if no x-acces-token  exists in headers ', async () => {
    const { authMiddleware } = makeAuthMiddleware()
    const httpResponse = await authMiddleware.handle({})

    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should call LoadAccountByToken with correct accessToken', async () => {
    const role = 'any_role'
    const { authMiddleware, loadAccountByTokenStub } = makeAuthMiddleware(role)
    const loadSpy = jest.spyOn(loadAccountByTokenStub, 'load')

    await authMiddleware.handle(mockRequest())

    expect(loadSpy).toHaveBeenCalledWith('any_token', role)
  })

  test('Should return 403 if LoadAccountByToken returns null', async () => {
    const { authMiddleware, loadAccountByTokenStub } = makeAuthMiddleware()
    jest.spyOn(loadAccountByTokenStub, 'load').mockReturnValueOnce(Promise.resolve(null))

    const httpResponse = await authMiddleware.handle(mockRequest())

    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 200 if LoadAccountByToken returns an account id', async () => {
    const { authMiddleware } = makeAuthMiddleware()

    const httpResponse = await authMiddleware.handle(mockRequest())

    expect(httpResponse).toEqual(ok({ accountId: 'any_id' }))
  })

  test('Should return 500 if LoadAccountByToken throws', async () => {
    const { authMiddleware, loadAccountByTokenStub } = makeAuthMiddleware()
    jest.spyOn(loadAccountByTokenStub, 'load').mockImplementationOnce(throwError)

    const httpResponse = await authMiddleware.handle(mockRequest())

    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
