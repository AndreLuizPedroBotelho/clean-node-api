import { throwError } from '@/domain/test'
import { BcryptAdapter } from './bcrypt-adapter'
import bcrypt from 'bcrypt'

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
    return await new Promise(resolve => resolve('hash'))
  },
  async compare (): Promise<boolean> {
    return await new Promise(resolve => resolve(true))
  }
}))

const salt = 12

const makeBcryptAdapter = (): BcryptAdapter => {
  return new BcryptAdapter(salt)
}

describe('Bcrypt Adapter', () => {
  describe('hash()', () => {
    test('Should call hash with correct values', async () => {
      const bcryptAdapter = makeBcryptAdapter()

      const hashSpy = jest.spyOn(bcrypt, 'hash')

      await bcryptAdapter.hash('any_value')

      expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
    })

    test('Should return a valid  hash on hash success', async () => {
      const bcryptAdapter = makeBcryptAdapter()

      const hash = await bcryptAdapter.hash('any_value')

      expect(hash).toBe('hash')
    })

    test('Should throw if hash throws', async () => {
      const bcryptAdapter = makeBcryptAdapter()

      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(throwError)
      const promise = bcryptAdapter.hash('any_value')

      await expect(promise).rejects.toThrow()
    })
  })

  describe('compare()', () => {
    test('Should call compare with correct values', async () => {
      const bcryptAdapter = makeBcryptAdapter()

      const compareSpy = jest.spyOn(bcrypt, 'compare')

      await bcryptAdapter.compare('any_value', 'any_hash')

      expect(compareSpy).toHaveBeenCalledWith('any_value', 'any_hash')
    })

    test('Should return true when compare success', async () => {
      const bcryptAdapter = makeBcryptAdapter()

      const isValid = await bcryptAdapter.compare('any_value', 'any_hash')

      expect(isValid).toBe(true)
    })

    test('Should return false when compare fails', async () => {
      const bcryptAdapter = makeBcryptAdapter()

      jest.spyOn(bcrypt, 'compare').mockReturnValueOnce(new Promise(resolve => resolve(false)))

      const isValid = await bcryptAdapter.compare('any_value', 'any_hash')

      expect(isValid).toBe(false)
    })

    test('Should throw if compare throws', async () => {
      const bcryptAdapter = makeBcryptAdapter()

      jest.spyOn(bcrypt, 'compare').mockImplementationOnce(throwError)
      const promise = bcryptAdapter.compare('any_value', 'any_hash')

      await expect(promise).rejects.toThrow()
    })
  })
})
