import { throwError } from '@/domain/test'
import {
  LoadAccountByToken,
  HttpRequest,
  forbidden,
  ok,
  serverError
} from './auth-middleware-protocols'
import { AuthMiddleware } from './auth-middleware'
import { AccessDeniedError } from '@/presentation/errors'
import { mockLoadAccountByToken } from '@/presentation/test'

type AuthMiddlewareTypes = {
  authMiddleware: AuthMiddleware
  loadAccountByTokenStub: LoadAccountByToken
}

const makeFakeRequest = (): HttpRequest => ({
  headers: {
    'x-access-token': 'any_token'
  }
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

    await authMiddleware.handle(makeFakeRequest())

    expect(loadSpy).toHaveBeenCalledWith('any_token', role)
  })

  test('Should return 403 if LoadAccountByToken returns null', async () => {
    const { authMiddleware, loadAccountByTokenStub } = makeAuthMiddleware()
    jest.spyOn(loadAccountByTokenStub, 'load').mockReturnValueOnce(Promise.resolve(null as any))

    const httpResponse = await authMiddleware.handle(makeFakeRequest())

    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 200 if LoadAccountByToken returns an account id', async () => {
    const { authMiddleware } = makeAuthMiddleware()

    const httpResponse = await authMiddleware.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({ accountId: 'any_id' }))
  })

  test('Should return 500 if LoadAccountByToken throws', async () => {
    const { authMiddleware, loadAccountByTokenStub } = makeAuthMiddleware()
    jest.spyOn(loadAccountByTokenStub, 'load').mockImplementationOnce(throwError)

    const httpResponse = await authMiddleware.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
