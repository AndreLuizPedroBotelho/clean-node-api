import { Encrypter, AddAccountModel, AccountModel, AddAccountRepository } from './db-add-account-protocols'
import { DbAddAcount } from './db-add-account'

interface DbAddAcountTypes{
  dbAddAcount: DbAddAcount
  encrypterStub: Encrypter
  addAccountRepositoryStub: AddAccountRepository
}

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
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'hashed_password'
      }

      return await new Promise(resolve => resolve(fakeAccount))
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

    const accountData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    await dbAddAcount.add(accountData)
    expect(encryptSpy).toHaveBeenCalledWith('valid_password')
  })

  test('Should throw if Encrypter throw', async () => {
    const { encrypterStub, dbAddAcount } = makeDbAddAcount()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValue(
      new Promise((resolve, reject) => reject(new Error()))
    )

    const accountData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    const promise = dbAddAcount.add(accountData)

    await expect(promise).rejects.toThrow()
  })

  test('Should call AddAcountRepository with correct values', async () => {
    const { addAccountRepositoryStub, dbAddAcount } = makeDbAddAcount()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')

    const accountData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    await dbAddAcount.add(accountData)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'hashed_password'
    })
  })
})
