import { AccountModel, LoadAccountByToken, Decrypter } from './db-load-account-by-token-protocols'

export class DbLoadAccountByToken implements LoadAccountByToken {
  constructor (
    private readonly decrypter: Decrypter
  ) {}

  async load (accessToken: string, role?: string): Promise<AccountModel> {
    await this.decrypter.decrypt(accessToken)
    return await new Promise((resolve, reject) => {
      resolve(null as unknown as AccountModel)
    })
  }
}
