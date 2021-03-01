import { BcryptAdapter } from './bcrypt-adapter'
import bcrypt from 'bcrypt'
describe('Bcrypt Adapter', () => {
  test('Should call bcrypt with correct value', async () => {
    const salt = 12

    const bcryptAdapter = new BcryptAdapter(salt)

    const hashSpy = jest.spyOn(bcrypt, 'hash')
    await bcryptAdapter.encrypt('any_value')

    expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
  })
})
