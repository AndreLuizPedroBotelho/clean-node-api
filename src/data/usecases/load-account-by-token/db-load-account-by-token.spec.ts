import { Decrypter, LoadAccountByTokenRepository, AccountModel } from './db-load-account-by-token-protocols'
import { DbLoadAccountByToken } from './db-load-account-by-token'

interface DbLoadAccountByTokenTypes{
  dbLoadAccountByToken: DbLoadAccountByToken
  decrypterStub: Decrypter
  loadAccountByTokenRepository: LoadAccountByTokenRepository
}

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
})

const makeDecrypter = (): Decrypter => {
  class DecrypterStub implements Decrypter {
    async decrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('any_value'))
    }
  }

  return new DecrypterStub()
}

const makeLoadAccountByTokenRepository = (): LoadAccountByTokenRepository => {
  class LoadAccountByTokenRepositoryStub implements LoadAccountByTokenRepository {
    async loadByToken (token: string, role?: string): Promise<AccountModel> {
      return await new Promise(resolve => resolve(makeFakeAccount()))
    }
  }

  return new LoadAccountByTokenRepositoryStub()
}

const makeDbLoadAccountByToken = (): DbLoadAccountByTokenTypes => {
  const decrypterStub = makeDecrypter()
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

    expect(account).toEqual(makeFakeAccount())
  })

  test('Should throw if Decrypter throws', async () => {
    const { dbLoadAccountByToken, decrypterStub } = makeDbLoadAccountByToken()

    jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const promise = dbLoadAccountByToken.load('any_token', 'any_role')

    await expect(promise).rejects.toThrow()
  })

  test('Should throw if LoadAccountByTokenRepository throws', async () => {
    const { dbLoadAccountByToken, loadAccountByTokenRepository } = makeDbLoadAccountByToken()

    jest.spyOn(loadAccountByTokenRepository, 'loadByToken').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const promise = dbLoadAccountByToken.load('any_token', 'any_role')

    await expect(promise).rejects.toThrow()
  })
})
