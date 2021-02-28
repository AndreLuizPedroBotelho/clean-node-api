import { DBAddAcount } from './db-add-account'

describe('DBAddAcount UseCase', () => {
  test('Should call Encrypter with correct password', async () => {
    class EncrypterStub {
      async encrypt (value: string): Promise<string> {
        return await new Promise(resolve => resolve('hashed_password'))
      }
    }
    const encrypterStub = new EncrypterStub()

    const dBAddAcount = new DBAddAcount(encrypterStub)
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')

    const accountData = {
      name: 'valid_name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    }

    await dBAddAcount.add(accountData)
    expect(encryptSpy).toHaveBeenCalledWith('valid_password')
  })
})
