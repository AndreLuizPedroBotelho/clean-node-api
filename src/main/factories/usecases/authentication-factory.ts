import { Authentication } from '@/domain/usecases'
import { JwtAdapter, BcryptAdapter } from '@/infra/criptography'
import { AccountMongoRepository } from '@/infra/db'

import { DbAuthentication } from '@/data/usecases'
import env from '@/main/config/env'

export const makeDbAutentication = (): Authentication => {
  const salt = 12

  const accountMongoRepository = new AccountMongoRepository()
  const bcryptAdapter = new BcryptAdapter(salt)
  const jwtAdapter = new JwtAdapter(env.jwtSecret)

  return new DbAuthentication(
    accountMongoRepository,
    bcryptAdapter,
    jwtAdapter,
    accountMongoRepository
  )
}
