import { LoginController } from '../../../presentation/controllers/login/login'
import { Controller } from '../../../presentation/protocols'
import { LogControllerDecorator } from '../../decorators/log'
import { LogMongoRepository } from '../../../infra/db/mongodb/log-repository/log'

import { makeLoginValidation } from './login-validation'
import { Authentication } from '../../../domain/usecases/authentication'

export const makeLoginController = (): Controller => {
  const logMongoRepository = new LogMongoRepository()

  const signUpController = new LoginController(null as unknown as Authentication, makeLoginValidation())

  return new LogControllerDecorator(signUpController, logMongoRepository)
}
