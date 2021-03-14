import {
  Encrypter,
  AddAccount,
  AddAccountModel,
  AccountModel,
  AddAccountRepository
} from './db-add-account-protocols'

export class DbAddAccount implements AddAccount {
  private readonly encrypter: Encrypter
  private readonly addAccount: AddAccountRepository

  constructor (encrypter: Encrypter, addAccount: AddAccountRepository) {
    this.encrypter = encrypter
    this.addAccount = addAccount
  }

  async add (accountData: AddAccountModel): Promise<AccountModel> {
    const hashedPassword = await this.encrypter.encrypt(accountData.password)

    const account = await this.addAccount.add(Object.assign({}, accountData, {
      password: hashedPassword
    }))

    return account
  }
}
