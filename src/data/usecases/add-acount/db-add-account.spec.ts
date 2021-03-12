import { Encrypter, AddAccountModel, AccountModel, AddAccountRepository } from './db-add-account-protocols'
import { DbAddAcount } from './db-add-account'

interface DbAddAcountTypes{
  dbAddAcount: DbAddAcount
  encrypterStub: Encrypter
  addAccountRepositoryStub: AddAccountRepository
}

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
})

const makeFakeAccountData = (): AddAccountModel => ({
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
})

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }

  return new EncrypterStub()
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add (account: AddAccountModel): Promise<AccountModel> {
      return await new Promise(resolve => resolve(makeFakeAccount()))
    }
  }

  return new AddAccountRepositoryStub()
}

const makeDbAddAcount = (): DbAddAcountTypes => {
  const addAccountRepositoryStub = makeAddAccountRepository()
  const encrypterStub = makeEncrypter()

  const dbAddAcount = new DbAddAcount(encrypterStub, addAccountRepositoryStub)

  return {
    dbAddAcount,
    encrypterStub,
    addAccountRepositoryStub
  }
}
describe('DbAddAcount UseCase', () => {
  test('Should call Encrypter with correct password', async () => {
    const { encrypterStub, dbAddAcount } = makeDbAddAcount()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')

    await dbAddAcount.add(makeFakeAccountData())
    expect(encryptSpy).toHaveBeenCalledWith('valid_password')
  })

  test('Should throw if Encrypter throw', async () => {
    const { encrypterStub, dbAddAcount } = makeDbAddAcount()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValue(
      new Promise((resolve, reject) => reject(new Error()))
    )

    const promise = dbAddAcount.add(makeFakeAccountData())

    await expect(promise).rejects.toThrow()
  })

  test('Should call AddAcountRepository with correct values', async () => {
    const { addAccountRepositoryStub, dbAddAcount } = makeDbAddAcount()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')

    await dbAddAcount.add(makeFakeAccountData())
    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'hashed_password'
    })
  })

  test('Should throw if Encrypter throw', async () => {
    const { addAccountRepositoryStub, dbAddAcount } = makeDbAddAcount()
    jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValue(
      new Promise((resolve, reject) => reject(new Error()))
    )

    const promise = dbAddAcount.add(makeFakeAccountData())

    await expect(promise).rejects.toThrow()
  })

  test('Should return an account on success', async () => {
    const { dbAddAcount } = makeDbAddAcount()

    const account = await dbAddAcount.add(makeFakeAccountData())
    expect(account).toEqual(makeFakeAccount())
  })
})
