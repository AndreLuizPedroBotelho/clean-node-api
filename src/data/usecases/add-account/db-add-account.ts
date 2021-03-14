import {
  Hasher,
  AddAccount,
  AddAccountModel,
  AccountModel,
  AddAccountRepository
} from './db-add-account-protocols'

export class DbAddAccount implements AddAccount {
  private readonly hasher: Hasher
  private readonly addAccount: AddAccountRepository

  constructor (hasher: Hasher, addAccount: AddAccountRepository) {
    this.hasher = hasher
    this.addAccount = addAccount
  }

  async add (accountData: AddAccountModel): Promise<AccountModel> {
    const hashedPassword = await this.hasher.hash(accountData.password)

    const account = await this.addAccount.add(Object.assign({}, accountData, {
      password: hashedPassword
    }))

    return account
  }
}
