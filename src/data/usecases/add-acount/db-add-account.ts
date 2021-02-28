import { Encrypter, AddAccount, AddAccountModel, AccountModel } from './db-add-account-protocols'

export class DbAddAcount implements AddAccount {
  private readonly encrypter: Encrypter

  constructor (encrypter: Encrypter) {
    this.encrypter = encrypter
  }

  async add (account: AddAccountModel): Promise<AccountModel> {
    const { password } = account
    await this.encrypter.encrypt(password)

    return await new Promise(resolve => resolve(null as unknown as AccountModel))
  }
}
