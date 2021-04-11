import { SignUpController } from '../../../presentation/controllers/signup/signup-controller'
import { BcryptAdapter } from '../../../infra/criptography/bcrypt-adapter/bcrypt-adapter'
import { Controller } from '../../../presentation/protocols'
import { LogControllerDecorator } from '../../decorators/log-controller-decorator'
import { LogMongoRepository } from '../../../infra/db/mongodb/log/log-mongo-repository'
import { AccountMongoRepository } from '../../../infra/db/mongodb/account/account-mongo-repository'
import { DbAddAccount } from '../../../data/usecases/add-account/db-add-account'
import { makeSignUpValidation } from './signup-validation-factory'
import { JwtAdapter } from '../../../infra/criptography/jwt-adapter/jwt-adapter'
import { DbAuthentication } from '../../../data/usecases/authentication/db-authentication'
import env from '../../config/env'

export const makeSignUpController = (): Controller => {
  const salt = 12

  const bcryptAdapter = new BcryptAdapter(salt)

  const accountMongoRepository = new AccountMongoRepository()
  const logMongoRepository = new LogMongoRepository()

  const jwtAdapter = new JwtAdapter(env.jwtSecret)

  const dbAuthentication = new DbAuthentication(
    accountMongoRepository,
    bcryptAdapter,
    jwtAdapter,
    accountMongoRepository
  )

  const dbAddAccount = new DbAddAccount(bcryptAdapter, accountMongoRepository)

  const signUpController = new SignUpController(dbAddAccount, makeSignUpValidation(), dbAuthentication)

  return new LogControllerDecorator(signUpController, logMongoRepository)
}
