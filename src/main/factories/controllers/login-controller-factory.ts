import { makeLogControllerDecorator } from '@/main/factories/decorators'
import { makeDbAutentication } from '@/main/factories/usecases'

import { Controller } from '@/presentation/protocols'
import { LoginController } from '@/presentation/controllers'

import { makeLoginValidation } from './login-validation-factory'

export const makeLoginController = (): Controller => {
  const dbAuthentication = makeDbAutentication()
  const loginValidation = makeLoginValidation()

  const loginController = new LoginController(dbAuthentication, loginValidation)

  return makeLogControllerDecorator(loginController)
}
