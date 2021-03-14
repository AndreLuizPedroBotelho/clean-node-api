import { AccountModel } from '../../../domain/models/account'
import { AuthenticationModel } from '../../../domain/usecases/authentication'
import { HashComparer } from '../../protocols/cryptography/hash-comparer'
import { LoadAccountByEmailRepository } from '../../protocols/db/load-account-by-email=repository'
import { DbAuthentication } from './db-authentication'

interface DbAddAccountTypes{
  dbAuthentication: DbAuthentication
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  hashComparerStub: HashComparer
}

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'hashed_password'
})

const makeFakeAuthentication = (): AuthenticationModel => ({
  email: 'any_email@mail.com',
  password: 'any_password'
})

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async load (email: string): Promise<AccountModel> {
      return await new Promise(resolve => resolve(makeFakeAccount()))
    }
  }

  return new LoadAccountByEmailRepositoryStub()
}

const makeHashComparer = (): HashComparer => {
  class HashComparerStub implements HashComparer {
    async compare (value: string, hash: string): Promise<boolean> {
      return await new Promise(resolve => resolve(true))
    }
  }

  return new HashComparerStub()
}

const makeDbAuthentication = (): DbAddAccountTypes => {
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()
  const hashComparerStub = makeHashComparer()

  const dbAuthentication = new DbAuthentication(loadAccountByEmailRepositoryStub, hashComparerStub)

  return {
    dbAuthentication,
    loadAccountByEmailRepositoryStub,
    hashComparerStub
  }
}
describe('DbAuthentication UseCase', () => {
  test('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { dbAuthentication, loadAccountByEmailRepositoryStub } = makeDbAuthentication()

    const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load')

    await dbAuthentication.auth(makeFakeAuthentication())

    expect(loadSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  test('Should throw if LoadAccountByEmailRepository throws', async () => {
    const { dbAuthentication, loadAccountByEmailRepositoryStub } = makeDbAuthentication()

    jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const promise = dbAuthentication.auth(makeFakeAuthentication())

    await expect(promise).rejects.toThrow()
  })

  test('Should return null if LoadAccountByEmailRepository returns null', async () => {
    const { dbAuthentication, loadAccountByEmailRepositoryStub } = makeDbAuthentication()

    jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(null as unknown as Promise<AccountModel>)

    const accessToken = await dbAuthentication.auth(makeFakeAuthentication())

    expect(accessToken).toBeNull()
  })

  test('Should call HashComparer with correct values', async () => {
    const { dbAuthentication, hashComparerStub } = makeDbAuthentication()

    const compareSpy = jest.spyOn(hashComparerStub, 'compare')

    await dbAuthentication.auth(makeFakeAuthentication())

    expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password')
  })
})
