import { SignUpController } from '../../presentation/controllers/signup/signup'
import { EmailValidatorAdapter } from '../../utils/email-validator-adapter'
import { DbAddAcount } from '../../data/usecases/add-acount/db-add-account'
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { AccountMongoRepository } from '../../infra/db/mongodb/account-repository/account'
import { Controller } from '../../presentation/protocols'
import { LogControlerDecorator } from '../decorators/log'

export const makeSignUpController = (): Controller => {
  const salt = 12

  const bcryptAdapter = new BcryptAdapter(salt)
  const accountMongoRepository = new AccountMongoRepository()

  const emailValidatorAdapter = new EmailValidatorAdapter()
  const dbAddAcount = new DbAddAcount(bcryptAdapter, accountMongoRepository)

  const signUpController = new SignUpController(emailValidatorAdapter, dbAddAcount)

  return new LogControlerDecorator(signUpController)
}
