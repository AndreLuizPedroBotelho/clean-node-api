import { DbAuthentication } from '@/data/usecases'
import {
  LoadAccountByEmailRepository,
  HashComparer,
  Encrypter,
  UpdateAccessTokenRepository
} from '@/data/protocols'
import {
  mockHashComparer,
  mockEncrypter,
  mockLoadAccountByEmailRepository,
  mockUpdateAccessTokenRepository
} from '@/tests/data/mocks'
import { throwError, mockAuthentication, mockAccountModel } from '@/tests/domain/mocks'

type DbAddAccountTypes = {
  dbAuthentication: DbAuthentication
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  hashComparerStub: HashComparer
  encrypterStub: Encrypter
  updateAccessTokenRepositoryStub: UpdateAccessTokenRepository
}

const makeDbAuthentication = (): DbAddAccountTypes => {
  const loadAccountByEmailRepositoryStub = mockLoadAccountByEmailRepository()
  const updateAccessTokenRepositoryStub = mockUpdateAccessTokenRepository()

  const hashComparerStub = mockHashComparer()
  const encrypterStub = mockEncrypter()

  const dbAuthentication = new DbAuthentication(
    loadAccountByEmailRepositoryStub,
    hashComparerStub,
    encrypterStub,
    updateAccessTokenRepositoryStub
  )

  return {
    dbAuthentication,
    loadAccountByEmailRepositoryStub,
    hashComparerStub,
    encrypterStub,
    updateAccessTokenRepositoryStub
  }
}
describe('DbAuthentication UseCase', () => {
  test('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { dbAuthentication, loadAccountByEmailRepositoryStub } = makeDbAuthentication()

    const loadByEmailSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')

    await dbAuthentication.auth(mockAuthentication())

    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  test('Should throw if LoadAccountByEmailRepository throws', async () => {
    const { dbAuthentication, loadAccountByEmailRepositoryStub } = makeDbAuthentication()

    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockImplementationOnce(throwError)

    const promise = dbAuthentication.auth(mockAuthentication())

    await expect(promise).rejects.toThrow()
  })

  test('Should return null if LoadAccountByEmailRepository returns null', async () => {
    const { dbAuthentication, loadAccountByEmailRepositoryStub } = makeDbAuthentication()

    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(null)

    const authentication = await dbAuthentication.auth(mockAuthentication())

    expect(authentication).toBeNull()
  })

  test('Should call HashComparer with correct values', async () => {
    const { dbAuthentication, hashComparerStub } = makeDbAuthentication()

    const compareSpy = jest.spyOn(hashComparerStub, 'compare')

    await dbAuthentication.auth(mockAuthentication())

    expect(compareSpy).toHaveBeenCalledWith('any_password', 'any_password')
  })

  test('Should throw if HashComparer throws', async () => {
    const { dbAuthentication, hashComparerStub } = makeDbAuthentication()

    jest.spyOn(hashComparerStub, 'compare').mockImplementationOnce(throwError)

    const promise = dbAuthentication.auth(mockAuthentication())

    await expect(promise).rejects.toThrow()
  })

  test('Should return null if HashComparer returns false', async () => {
    const { dbAuthentication, hashComparerStub } = makeDbAuthentication()

    jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(Promise.resolve(false))

    const authentication = await dbAuthentication.auth(mockAuthentication())

    expect(authentication).toBeNull()
  })

  test('Should call Encrypter with correct id', async () => {
    const { dbAuthentication, encrypterStub } = makeDbAuthentication()

    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')

    await dbAuthentication.auth(mockAuthentication())

    expect(encryptSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should throw if Encrypter throws', async () => {
    const { dbAuthentication, encrypterStub } = makeDbAuthentication()

    jest.spyOn(encrypterStub, 'encrypt').mockImplementationOnce(throwError)

    const promise = dbAuthentication.auth(mockAuthentication())

    await expect(promise).rejects.toThrow()
  })

  test('Should return a AuthenticationModel on success', async () => {
    const { dbAuthentication } = makeDbAuthentication()

    const { accessToken, name } = await dbAuthentication.auth(mockAuthentication())

    expect(accessToken).toEqual('any_token')
    expect(name).toEqual(mockAccountModel().name)
  })

  test('Should call UpdateAccessTokenRepository with correct values', async () => {
    const { dbAuthentication, updateAccessTokenRepositoryStub } = makeDbAuthentication()

    const updateAccessTokenSpy = jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken')

    await dbAuthentication.auth(mockAuthentication())

    expect(updateAccessTokenSpy).toHaveBeenCalledWith('any_id', 'any_token')
  })

  test('Should throw if UpdateAccessTokenRepository throws', async () => {
    const { dbAuthentication, updateAccessTokenRepositoryStub } = makeDbAuthentication()

    jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken').mockImplementationOnce(throwError)

    const promise = dbAuthentication.auth(mockAuthentication())

    await expect(promise).rejects.toThrow()
  })
})
