import { HttpRequest } from './../protocols/http'
import { LoadAccountByToken } from './../../domain/usecases/load-account-by-token'
import { AuthMiddleware } from './auth-middleware'
import { AccessDeniedError } from './../errors'
import { forbidden } from './../helpers/http/http-helper'
import { AccountModel } from '../../domain/models/account'

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

const makeAuthMiddleware = (): AuthMiddlewareTypes => {
  const loadAccountByTokenStub = makeLoadAccountByToken()

  const authMiddleware = new AuthMiddleware(loadAccountByTokenStub)

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

  test('Should call LoadAccountByToken with correct Accessstoken', async () => {
    const { authMiddleware, loadAccountByTokenStub } = makeAuthMiddleware()
    const loadSpy = jest.spyOn(loadAccountByTokenStub, 'load')

    await authMiddleware.handle(makeFakeRequest())

    expect(loadSpy).toHaveBeenCalledWith('any_token')
  })

  test('Should return 403 if LoadAccountByToken returns null', async () => {
    const { authMiddleware, loadAccountByTokenStub } = makeAuthMiddleware()
    jest.spyOn(loadAccountByTokenStub, 'load').mockReturnValueOnce(new Promise(resolve => resolve(null as any)))

    const httpResponse = await authMiddleware.handle(makeFakeRequest())

    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })
})
