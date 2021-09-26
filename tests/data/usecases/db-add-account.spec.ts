import { AddAccountRepository, Hasher, LoadAccountByEmailRepository } from '@/data/protocols'
import { DbAddAccount } from '@/data/usecases'
import { mockLoadAccountByEmailRepository, mockHasher, mockAddAccountRepository } from '@/tests/data/mocks'
import { mockAccountParams, mockAccountModel, throwError } from '@/tests/domain/mocks'

type DbAddAccountTypes = {
  dbAddAccount: DbAddAccount
  hasherStub: Hasher
  addAccountRepositoryStub: AddAccountRepository
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
}

const makeDbAddAccount = (): DbAddAccountTypes => {
  const addAccountRepositoryStub = mockAddAccountRepository()
  const hasherStub = mockHasher()
  const loadAccountByEmailRepositoryStub = mockLoadAccountByEmailRepository()

  jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValue(Promise.resolve(null))

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

    await dbAddAccount.add(mockAccountParams())
    expect(hashSpy).toHaveBeenCalledWith('any_password')
  })

  test('Should throw if Hasher throw', async () => {
    const { hasherStub, dbAddAccount } = makeDbAddAccount()

    jest.spyOn(hasherStub, 'hash').mockImplementationOnce(throwError)

    const promise = dbAddAccount.add(mockAccountParams())

    await expect(promise).rejects.toThrow()
  })

  test('Should call AddAccountRepository with correct values', async () => {
    const { addAccountRepositoryStub, dbAddAccount } = makeDbAddAccount()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')

    await dbAddAccount.add(mockAccountParams())
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'hashed_password'
    })
  })

  test('Should throw if AddAccountRepository throw', async () => {
    const { addAccountRepositoryStub, dbAddAccount } = makeDbAddAccount()
    jest.spyOn(addAccountRepositoryStub, 'add').mockImplementationOnce(throwError)

    const promise = dbAddAccount.add(mockAccountParams())

    await expect(promise).rejects.toThrow()
  })

  test('Should return true if LoadAccountByEmailRepository returns null', async () => {
    const { dbAddAccount } = makeDbAddAccount()

    const account = await dbAddAccount.add(mockAccountParams())
    expect(account).toBeTruthy()
  })

  test('Should return false if LoadAccountByEmailRepository returns an account', async () => {
    const { dbAddAccount, loadAccountByEmailRepositoryStub } = makeDbAddAccount()

    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockImplementationOnce(async () => {
      return await Promise.resolve(mockAccountModel())
    })

    const account = await dbAddAccount.add(mockAccountParams())
    expect(account).toBeFalsy()
  })

  test('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { dbAddAccount, loadAccountByEmailRepositoryStub } = makeDbAddAccount()

    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')

    await dbAddAccount.add(mockAccountParams())

    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })
})
