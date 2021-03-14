import { JwtAdapter } from './jwt-adapter'
import jwt from 'jsonwebtoken'

const makeJwtAdapter = (): JwtAdapter => {
  return new JwtAdapter('secret')
}

describe('Jwt Adapter', () => {
  test('should call sign with correct values', async () => {
    const jwtAdapter = makeJwtAdapter()

    const signSpy = jest.spyOn(jwt, 'sign')

    await jwtAdapter.encrypt('any_id')

    expect(signSpy).toHaveBeenCalledWith({ id: 'any_id' }, 'secret')
  })
})
