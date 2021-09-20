import { JwtAdapter } from '@/infra/criptography'
import jwt from 'jsonwebtoken'

jest.mock('jsonwebtoken', () => ({
  async sign(): Promise<string> {
    return await Promise.resolve('token')
  },

  async verify(): Promise<string> {
    return await Promise.resolve('any_value')
  }
}))

const makeJwtAdapter = (): JwtAdapter => {
  return new JwtAdapter('secret')
}

describe('Jwt Adapter', () => {
  describe('sign()', () => {
    test('Should call sign with correct values', async () => {
      const jwtAdapter = makeJwtAdapter()

      const signSpy = jest.spyOn(jwt, 'sign')

      await jwtAdapter.encrypt('any_id')

      expect(signSpy).toHaveBeenCalledWith({ id: 'any_id' }, 'secret')
    })

    test('Should return a token on sign success', async () => {
      const jwtAdapter = makeJwtAdapter()

      const accessToken = await jwtAdapter.encrypt('any_id')

      expect(accessToken).toBe('token')
    })

    test('Should throw if sign throws', async () => {
      const jwtAdapter = makeJwtAdapter()

      jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
        throw new Error()
      })

      const promise = jwtAdapter.encrypt('any_id')

      await expect(promise).rejects.toThrow()
    })
  })

  describe('verify()', () => {
    test('Should call verify with correct values', async () => {
      const jwtAdapter = makeJwtAdapter()

      const verifySpy = jest.spyOn(jwt, 'verify')

      await jwtAdapter.decrypt('any_token')

      expect(verifySpy).toHaveBeenCalledWith('any_token', 'secret')
    })

    test('Should return a token on verify success', async () => {
      const jwtAdapter = makeJwtAdapter()

      const accessToken = await jwtAdapter.decrypt('any_token')

      expect(accessToken).toBe('any_value')
    })

    test('Should throw if verify throws', async () => {
      const jwtAdapter = makeJwtAdapter()

      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
        throw new Error()
      })

      const promise = jwtAdapter.decrypt('any_token')

      await expect(promise).rejects.toThrow()
    })
  })
})
