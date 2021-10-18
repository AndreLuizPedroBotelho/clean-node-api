
import {
  AddAccount
} from '@/domain/usecases'
import {
  Hasher,
  AddAccountRepository,
  CheckAccountByEmailRepository
} from '@/data/protocols'

export class DbAddAccount implements AddAccount {
  constructor(
    private readonly hasher: Hasher,
    private readonly addAccount: AddAccountRepository,
    private readonly checkAccountByEmailRepository: CheckAccountByEmailRepository
  ) { }

  async add(accountData: AddAccount.Params): Promise<AddAccount.Result> {
    const exists = await this.checkAccountByEmailRepository.checkByEmail(accountData.email)

    let isValid: AddAccount.Result = false

    if (!exists) {
      const hashedPassword = await this.hasher.hash(accountData.password)

      isValid = await this.addAccount.add({
        ...accountData,
        password: hashedPassword
      })
    }

    return isValid
  }
}
