import { AccountModel } from '../../../domain/models/account'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email=repository'
import { DbAuthentication } from './db-authentication'

interface DbAddAccountTypes{
  dbAuthentication: DbAuthentication
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
}

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
})

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async load (email: string): Promise<AccountModel> {
      return await new Promise(resolve => resolve(makeFakeAccount()))
    }
  }

  return new LoadAccountByEmailRepositoryStub()
}

const makeDbAuthentication = (): DbAddAccountTypes => {
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()
  const dbAuthentication = new DbAuthentication(loadAccountByEmailRepositoryStub)

  return {
    dbAuthentication,
    loadAccountByEmailRepositoryStub
  }
}
describe('DbAuthentication UseCase', () => {
  test('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { dbAuthentication, loadAccountByEmailRepositoryStub } = makeDbAuthentication()

    const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load')

    await dbAuthentication.auth({
      email: 'any_email@mail.com',
      password: 'any_password'
    })

    expect(loadSpy).toHaveBeenCalledWith('any_email@mail.com')
  })
})
