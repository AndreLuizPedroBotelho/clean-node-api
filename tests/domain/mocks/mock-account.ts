import { AuthenticationParams, AddAccount } from '@/domain/usecases'
import { AccountModel } from '@/domain/models'

export const mockAccountParams = (): AddAccount.Params => ({
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'any_password'
})

export const mockAccountWithTokenParams = (): Omit<AccountModel, 'id'> => ({
  ...mockAccountParams(),
  accessToken: 'any_token'
})

export const mockAccountModel = (): AccountModel => ({
  id: 'any_id',
  ...mockAccountParams()
})

export const mockAuthentication = (): AuthenticationParams => ({
  email: 'any_email@mail.com',
  password: 'any_password'
})
