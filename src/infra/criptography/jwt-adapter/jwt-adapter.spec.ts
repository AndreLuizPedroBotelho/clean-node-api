import { JwtAdapter } from './jwt-adapter'
import jwt from 'jsonwebtoken'

jest.mock('jsonwebtoken', () => ({
  async sign (): Promise<string> {
    return await new Promise(resolve => resolve('token'))
  }
}))

const makeJwtAdapter = (): JwtAdapter => {
  return new JwtAdapter('secret')
}

describe('Jwt Adapter', () => {
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
