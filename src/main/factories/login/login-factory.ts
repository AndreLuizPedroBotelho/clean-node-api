import { LoginController } from '../../../presentation/controllers/login/login-controller'
import { Controller } from '../../../presentation/protocols'
import { LogControllerDecorator } from '../../decorators/log-controller-decorator'
import { LogMongoRepository } from '../../../infra/db/mongodb/log/log-mongo-repository'

import { makeLoginValidation } from './login-validation-factory'
import { Authentication } from '../../../domain/usecases/authentication'

export const makeLoginController = (): Controller => {
  const logMongoRepository = new LogMongoRepository()

  const signUpController = new LoginController(null as unknown as Authentication, makeLoginValidation())

  return new LogControllerDecorator(signUpController, logMongoRepository)
}
