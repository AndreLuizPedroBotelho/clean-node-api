import { Decrypter } from './db-load-account-by-token-protocols'
import { DbLoadAccountByToken } from './db-load-account-by-token'

interface DbLoadAccountByTokenTypes{
  dbLoadAccountByToken: DbLoadAccountByToken
  decrypterStub: Decrypter
}

const makeDecrypter = (): Decrypter => {
  class DecrypterStub implements Decrypter {
    async decrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('any_value'))
    }
  }

  return new DecrypterStub()
}

const makeDbLoadAccountByToken = (): DbLoadAccountByTokenTypes => {
  const decrypterStub = makeDecrypter()
  const dbLoadAccountByToken = new DbLoadAccountByToken(decrypterStub)

  return {
    dbLoadAccountByToken,
    decrypterStub
  }
}

describe('DbLoadAccountByToken UseCase', () => {
  test('Should call Decrypter with correct values', async () => {
    const { dbLoadAccountByToken, decrypterStub } = makeDbLoadAccountByToken()

    const decryptSpy = jest.spyOn(decrypterStub, 'decrypt')

    await dbLoadAccountByToken.load('any_token')

    expect(decryptSpy).toHaveBeenCalledWith('any_token')
  })
})
