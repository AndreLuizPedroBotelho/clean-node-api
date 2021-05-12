import {
  Hasher,
  AddAccountParams,
  AccountModel,
  AddAccountRepository,
  LoadAccountByEmailRepository
} from './db-add-account-protocols'
import { DbAddAccount } from './db-add-account'

type DbAddAccountTypes = {
  dbAddAccount: DbAddAccount
  hasherStub: Hasher
  addAccountRepositoryStub: AddAccountRepository
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
}

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
})

const makeFakeAccountData = (): AddAccountParams => ({
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
})

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail (email: string): Promise<AccountModel> {
      return await new Promise(resolve => resolve(null as unknown as AccountModel))
    }
  }

  return new LoadAccountByEmailRepositoryStub()
}

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }

  return new HasherStub()
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add (account: AddAccountParams): Promise<AccountModel> {
      return await new Promise(resolve => resolve(makeFakeAccount()))
    }
  }

  return new AddAccountRepositoryStub()
}

const makeDbAddAccount = (): DbAddAccountTypes => {
  const addAccountRepositoryStub = makeAddAccountRepository()
  const hasherStub = makeHasher()
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()

  const dbAddAccount = new DbAddAccount(hasherStub, addAccountRepositoryStub, loadAccountByEmailRepositoryStub)

  return {
    dbAddAccount,
    hasherStub,
    addAccountRepositoryStub,
    loadAccountByEmailRepositoryStub
  }
}
describe('DbAddAccount UseCase', () => {
  test('Should call Hasher with correct password', async () => {
    const { hasherStub, dbAddAccount } = makeDbAddAccount()
    const hashSpy = jest.spyOn(hasherStub, 'hash')

    await dbAddAccount.add(makeFakeAccountData())
    expect(hashSpy).toHaveBeenCalledWith('valid_password')
  })

  test('Should throw if Hasher throw', async () => {
    const { hasherStub, dbAddAccount } = makeDbAddAccount()
    jest.spyOn(hasherStub, 'hash').mockReturnValue(
      new Promise((resolve, reject) => reject(new Error()))
    )

    const promise = dbAddAccount.add(makeFakeAccountData())

    await expect(promise).rejects.toThrow()
  })

  test('Should call AddAccountRepository with correct values', async () => {
    const { addAccountRepositoryStub, dbAddAccount } = makeDbAddAccount()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')

    await dbAddAccount.add(makeFakeAccountData())
    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'hashed_password'
    })
  })

  test('Should throw if AddAccountRepository throw', async () => {
    const { addAccountRepositoryStub, dbAddAccount } = makeDbAddAccount()
    jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValue(
      new Promise((resolve, reject) => reject(new Error()))
    )

    const promise = dbAddAccount.add(makeFakeAccountData())

    await expect(promise).rejects.toThrow()
  })

  test('Should return an account on success', async () => {
    const { dbAddAccount } = makeDbAddAccount()

    const account = await dbAddAccount.add(makeFakeAccountData())
    expect(account).toEqual(makeFakeAccount())
  })

  test('Should return null if LoadAccountByEmailRepository not returns null', async () => {
    const { dbAddAccount, loadAccountByEmailRepositoryStub } = makeDbAddAccount()

    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockImplementationOnce(async () => {
      return await new Promise(resolve => resolve(makeFakeAccount()))
    })

    const account = await dbAddAccount.add(makeFakeAccountData())
    expect(account).toBeNull()
  })

  test('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { dbAddAccount, loadAccountByEmailRepositoryStub } = makeDbAddAccount()

    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')

    await dbAddAccount.add(makeFakeAccountData())

    expect(loadByEmailSpy).toHaveBeenCalledWith('valid_email@mail.com')
  })
})
