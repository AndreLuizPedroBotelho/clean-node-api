import { mockDecrypter } from '@/data/test'
import { throwError, mockAccountModel } from '@/domain/test'
import { Decrypter, LoadAccountByTokenRepository, AccountModel } from './db-load-account-by-token-protocols'
import { DbLoadAccountByToken } from './db-load-account-by-token'

type DbLoadAccountByTokenTypes = {
  dbLoadAccountByToken: DbLoadAccountByToken
  decrypterStub: Decrypter
  loadAccountByTokenRepository: LoadAccountByTokenRepository
}

const makeLoadAccountByTokenRepository = (): LoadAccountByTokenRepository => {
  class LoadAccountByTokenRepositoryStub implements LoadAccountByTokenRepository {
    async loadByToken(token: string, role?: string): Promise<AccountModel> {
      return await new Promise(resolve => resolve(mockAccountModel()))
    }
  }

  return new LoadAccountByTokenRepositoryStub()
}

const makeDbLoadAccountByToken = (): DbLoadAccountByTokenTypes => {
  const decrypterStub = mockDecrypter()
  const loadAccountByTokenRepository = makeLoadAccountByTokenRepository()

  const dbLoadAccountByToken = new DbLoadAccountByToken(decrypterStub, loadAccountByTokenRepository)

  return {
    dbLoadAccountByToken,
    decrypterStub,
    loadAccountByTokenRepository
  }
}

describe('DbLoadAccountByToken UseCase', () => {
  test('Should call Decrypter with correct values', async () => {
    const { dbLoadAccountByToken, decrypterStub } = makeDbLoadAccountByToken()

    const decryptSpy = jest.spyOn(decrypterStub, 'decrypt')

    await dbLoadAccountByToken.load('any_token', 'any_role')

    expect(decryptSpy).toHaveBeenCalledWith('any_token')
  })

  test('Should return null if Decrypter returns null', async () => {
    const { dbLoadAccountByToken, decrypterStub } = makeDbLoadAccountByToken()

    jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(new Promise(resolve => resolve(null as any)))

    const account = await dbLoadAccountByToken.load('any_token', 'any_role')

    expect(account).toBeNull()
  })

  test('Should call LoadAccountByTokenRepository with correct values', async () => {
    const { dbLoadAccountByToken, loadAccountByTokenRepository } = makeDbLoadAccountByToken()

    const loadByTokenSpy = jest.spyOn(loadAccountByTokenRepository, 'loadByToken')

    await dbLoadAccountByToken.load('any_token', 'any_role')

    expect(loadByTokenSpy).toHaveBeenCalledWith('any_token', 'any_role')
  })

  test('Should return null if LoadAccountByTokenRepository returns null', async () => {
    const { dbLoadAccountByToken, loadAccountByTokenRepository } = makeDbLoadAccountByToken()

    jest.spyOn(loadAccountByTokenRepository, 'loadByToken').mockReturnValueOnce(new Promise(resolve => resolve(null as any)))

    const account = await dbLoadAccountByToken.load('any_token', 'any_role')

    expect(account).toBeNull()
  })

  test('Should return an account on success', async () => {
    const { dbLoadAccountByToken } = makeDbLoadAccountByToken()

    const account = await dbLoadAccountByToken.load('any_token', 'any_role')

    expect(account).toEqual(mockAccountModel())
  })

  test('Should throw if Decrypter throws', async () => {
    const { dbLoadAccountByToken, decrypterStub } = makeDbLoadAccountByToken()

    jest.spyOn(decrypterStub, 'decrypt').mockImplementationOnce(throwError)

    const promise = dbLoadAccountByToken.load('any_token', 'any_role')

    await expect(promise).rejects.toThrow()
  })

  test('Should throw if LoadAccountByTokenRepository throws', async () => {
    const { dbLoadAccountByToken, loadAccountByTokenRepository } = makeDbLoadAccountByToken()

    jest.spyOn(loadAccountByTokenRepository, 'loadByToken').mockImplementationOnce(throwError)

    const promise = dbLoadAccountByToken.load('any_token', 'any_role')

    await expect(promise).rejects.toThrow()
  })
})
