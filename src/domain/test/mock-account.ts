import { AuthenticationParams } from '@/domain/usecases/account/authentication'
import { AccountModel } from '@/domain/models/account'
import { AddAccountParams } from '@/domain/usecases/account/add-account'

export const mockAccountParams = (): AddAccountParams => ({
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'any_password'
})

export const mockAccountWithTokenParams = (): AddAccountParams => ({
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
