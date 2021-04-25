import {
  LoadAccountByToken,
  HttpRequest,
  AccountModel,
  forbidden,
  ok,
  serverError
} from './auth-middleware-protocols'
import { AuthMiddleware } from './auth-middleware'
import { AccessDeniedError } from '../errors'

interface AuthMiddlewareTypes{
  authMiddleware: AuthMiddleware
  loadAccountByTokenStub: LoadAccountByToken
}

const makeFakeRequest = (): HttpRequest => ({
  headers: {
    'x-access-token': 'any_token'
  }
})

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
})

const makeLoadAccountByToken = (): LoadAccountByToken => {
  class LoadAccountByTokenStub implements LoadAccountByToken {
    async load (accessToken: string): Promise<AccountModel> {
      return await new Promise(resolve => resolve(makeFakeAccount()))
    }
  }

  return new LoadAccountByTokenStub()
}

const makeAuthMiddleware = (role?: string): AuthMiddlewareTypes => {
  const loadAccountByTokenStub = makeLoadAccountByToken()

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
    jest.spyOn(loadAccountByTokenStub, 'load').mockReturnValueOnce(new Promise(resolve => resolve(null as any)))

    const httpResponse = await authMiddleware.handle(makeFakeRequest())

    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 200 if LoadAccountByToken returns an account id', async () => {
    const { authMiddleware } = makeAuthMiddleware()

    const httpResponse = await authMiddleware.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({ accountId: 'valid_id' }))
  })

  test('Should return 500 if LoadAccountByToken throws', async () => {
    const { authMiddleware, loadAccountByTokenStub } = makeAuthMiddleware()
    jest.spyOn(loadAccountByTokenStub, 'load').mockReturnValueOnce(new Promise((resolve, reject) => {
      reject(new Error())
    }))

    const httpResponse = await authMiddleware.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
