import { Encrypter } from '../../protocols/encrypter'
import { DbAddAcount } from './db-add-account'

interface DbAddAcountTypes{
  dbAddAcount: DbAddAcount
  encrypterStub: Encrypter
}
const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }

  return new EncrypterStub()
}
const makeDbAddAcount = (): DbAddAcountTypes => {
  const encrypterStub = makeEncrypter()
  const dbAddAcount = new DbAddAcount(encrypterStub)

  return {
    dbAddAcount,
    encrypterStub
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
})
