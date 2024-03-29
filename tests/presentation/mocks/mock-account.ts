import { LoadAccountByToken, AddAccount, Authentication } from '@/domain/usecases'
import { mockAccountModel, mockAuthenticationModel } from '@/tests/domain/mocks'

export const mockAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add(account: AddAccount.Params): Promise<AddAccount.Result> {
      return await Promise.resolve(true)
    }
  }

  return new AddAccountStub()
}

export const mockAuthentication = (): Authentication => {
  class AuthenticationStub implements Authentication {
    async auth(authentication: Authentication.Params): Promise<Authentication.Result> {
      return await Promise.resolve(mockAuthenticationModel())
    }
  }

  return new AuthenticationStub()
}

export const mockLoadAccountByToken = (): LoadAccountByToken => {
  class LoadAccountByTokenStub implements LoadAccountByToken {
    async load(accessToken: string): Promise<LoadAccountByToken.Result> {
      return await Promise.resolve({ id: mockAccountModel().id })
    }
  }

  return new LoadAccountByTokenStub()
}
