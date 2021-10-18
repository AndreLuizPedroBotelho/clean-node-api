import { AddAccountRepository, Hasher, CheckAccountByEmailRepository } from '@/data/protocols'
import { DbAddAccount } from '@/data/usecases'
import { mockCheckAccountByEmailRepository, mockHasher, mockAddAccountRepository } from '@/tests/data/mocks'
import { mockAccountParams, throwError } from '@/tests/domain/mocks'

type DbAddAccountTypes = {
  dbAddAccount: DbAddAccount
  hasherStub: Hasher
  addAccountRepositoryStub: AddAccountRepository
  checkAccountByEmailRepositoryStub: CheckAccountByEmailRepository
}

const makeDbAddAccount = (): DbAddAccountTypes => {
  const addAccountRepositoryStub = mockAddAccountRepository()
  const hasherStub = mockHasher()
  const checkAccountByEmailRepositoryStub = mockCheckAccountByEmailRepository()

  jest.spyOn(checkAccountByEmailRepositoryStub, 'checkByEmail').mockReturnValue(Promise.resolve(null))

  const dbAddAccount = new DbAddAccount(hasherStub, addAccountRepositoryStub, checkAccountByEmailRepositoryStub)

  return {
    dbAddAccount,
    hasherStub,
    addAccountRepositoryStub,
    checkAccountByEmailRepositoryStub
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

  test('Should return true on success', async () => {
    const { dbAddAccount } = makeDbAddAccount()

    const account = await dbAddAccount.add(mockAccountParams())
    expect(account).toBe(true)
  })

  test('Should return true if CheckAccountByEmailRepository returns false', async () => {
    const { dbAddAccount, addAccountRepositoryStub } = makeDbAddAccount()

    jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValue(Promise.resolve(false))

    const account = await dbAddAccount.add(mockAccountParams())
    expect(account).toBe(false)
  })

  test('Should return false if CheckAccountByEmailRepository returns an account', async () => {
    const { dbAddAccount, checkAccountByEmailRepositoryStub } = makeDbAddAccount()

    jest.spyOn(checkAccountByEmailRepositoryStub, 'checkByEmail').mockImplementationOnce(async () => {
      return await Promise.resolve(true)
    })

    const account = await dbAddAccount.add(mockAccountParams())
    expect(account).toBe(false)
  })

  test('Should call CheckAccountByEmailRepository with correct email', async () => {
    const { dbAddAccount, checkAccountByEmailRepositoryStub } = makeDbAddAccount()

    const checkByEmailSpy = jest.spyOn(checkAccountByEmailRepositoryStub, 'checkByEmail')

    await dbAddAccount.add(mockAccountParams())

    expect(checkByEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })
})
