import { DbLoadAccountByToken } from '@/data/usecases'
import { LoadAccountByTokenRepository, Decrypter } from '@/data/protocols'
import { mockDecrypter, mockLoadAccountByTokenRepository } from '@/tests/data/mocks'
import { throwError, mockAccountModel } from '@/tests/domain/mocks'
import faker from 'faker'

type DbLoadAccountByTokenTypes = {
  dbLoadAccountByToken: DbLoadAccountByToken
  decrypterStub: Decrypter
  loadAccountByTokenRepository: LoadAccountByTokenRepository
}

const makeDbLoadAccountByToken = (): DbLoadAccountByTokenTypes => {
  const decrypterStub = mockDecrypter()
  const loadAccountByTokenRepository = mockLoadAccountByTokenRepository()

  const dbLoadAccountByToken = new DbLoadAccountByToken(decrypterStub, loadAccountByTokenRepository)

  return {
    dbLoadAccountByToken,
    decrypterStub,
    loadAccountByTokenRepository
  }
}

let token: string
let role: string
describe('DbLoadAccountByToken UseCase', () => {
  beforeEach(() => {
    token = faker.datatype.uuid()
    role = faker.random.word()
  })

  test('Should call Decrypter with correct values', async () => {
    const { dbLoadAccountByToken, decrypterStub } = makeDbLoadAccountByToken()

    const decryptSpy = jest.spyOn(decrypterStub, 'decrypt')

    await dbLoadAccountByToken.load(token, role)

    expect(decryptSpy).toHaveBeenCalledWith(token)
  })

  test('Should return null if Decrypter returns null', async () => {
    const { dbLoadAccountByToken, decrypterStub } = makeDbLoadAccountByToken()

    jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(Promise.resolve(null))

    const account = await dbLoadAccountByToken.load(token, role)

    expect(account).toBeNull()
  })

  test('Should call LoadAccountByTokenRepository with correct values', async () => {
    const { dbLoadAccountByToken, loadAccountByTokenRepository } = makeDbLoadAccountByToken()

    const loadByTokenSpy = jest.spyOn(loadAccountByTokenRepository, 'loadByToken')

    await dbLoadAccountByToken.load(token, role)

    expect(loadByTokenSpy).toHaveBeenCalledWith(token, role)
  })

  test('Should return null if LoadAccountByTokenRepository returns null', async () => {
    const { dbLoadAccountByToken, loadAccountByTokenRepository } = makeDbLoadAccountByToken()

    jest.spyOn(loadAccountByTokenRepository, 'loadByToken').mockReturnValueOnce(Promise.resolve(null))

    const account = await dbLoadAccountByToken.load(token, role)

    expect(account).toBeNull()
  })

  test('Should return an account on success', async () => {
    const { dbLoadAccountByToken } = makeDbLoadAccountByToken()

    const account = await dbLoadAccountByToken.load(token, role)

    expect(account).toEqual(mockAccountModel())
  })

  test('Should throw if Decrypter throws', async () => {
    const { dbLoadAccountByToken, decrypterStub } = makeDbLoadAccountByToken()

    jest.spyOn(decrypterStub, 'decrypt').mockImplementationOnce(throwError)

    const account = await dbLoadAccountByToken.load(token, role)

    expect(account).toBeNull()
  })

  test('Should throw if LoadAccountByTokenRepository throws', async () => {
    const { dbLoadAccountByToken, loadAccountByTokenRepository } = makeDbLoadAccountByToken()

    jest.spyOn(loadAccountByTokenRepository, 'loadByToken').mockImplementationOnce(throwError)

    const promise = dbLoadAccountByToken.load(token, role)

    await expect(promise).rejects.toThrow()
  })
})
