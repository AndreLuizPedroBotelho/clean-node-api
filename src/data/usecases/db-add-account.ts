
import {
  AddAccount
} from '@/domain/usecases'
import {
  Hasher,
  AddAccountRepository,
  LoadAccountByEmailRepository
} from '@/data/protocols'

export class DbAddAccount implements AddAccount {
  constructor(
    private readonly hasher: Hasher,
    private readonly addAccount: AddAccountRepository,
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  ) { }

  async add(accountData: AddAccount.Params): Promise<AddAccount.Result> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(accountData.email)

    let isValid: AddAccount.Result = false

    if (!account) {
      const hashedPassword = await this.hasher.hash(accountData.password)

      isValid = await this.addAccount.add({
        ...accountData,
        password: hashedPassword
      })
    }

    return isValid
  }
}
