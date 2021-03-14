import { BcryptAdapter } from './bcrypt-adapter'
import bcrypt from 'bcrypt'

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
    return await new Promise(resolve => resolve('hash'))
  }
}))
const salt = 12

const makeBcryptAdapter = (): BcryptAdapter => {
  return new BcryptAdapter(salt)
}

describe('Bcrypt Adapter', () => {
  test('Should call bcrypt with correct values', async () => {
    const bcryptAdapter = makeBcryptAdapter()

    const hashSpy = jest.spyOn(bcrypt, 'hash')

    await bcryptAdapter.hash('any_value')

    expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
  })

  test('Should return a hash on success', async () => {
    const bcryptAdapter = makeBcryptAdapter()

    const hash = await bcryptAdapter.hash('any_value')

    expect(hash).toBe('hash')
  })

  test('Should throw if bcrypt throws', async () => {
    const bcryptAdapter = makeBcryptAdapter()

    jest.spyOn(bcrypt, 'hash').mockReturnValue(
      new Promise((resolve, reject) => reject(new Error()))
    )

    const promise = bcryptAdapter.hash('any_value')

    await expect(promise).rejects.toThrow()
  })
})
