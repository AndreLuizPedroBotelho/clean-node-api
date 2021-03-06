import { LoadAccountByEmailRepository } from '../authentication/db-authentication-protocols'
import {
  Hasher,
  AddAccount,
  AddAccountModel,
  AccountModel,
  AddAccountRepository
} from './db-add-account-protocols'

export class DbAddAccount implements AddAccount {
  constructor (
    private readonly hasher: Hasher,
    private readonly addAccount: AddAccountRepository,
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  ) {}

  async add (accountData: AddAccountModel): Promise<AccountModel> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(accountData.email)

    if (account) {
      return null as unknown as AccountModel
    }

    const hashedPassword = await this.hasher.hash(accountData.password)

    const newAccount = await this.addAccount.add(Object.assign({}, accountData, {
      password: hashedPassword
    }))

    return newAccount
  }
}
