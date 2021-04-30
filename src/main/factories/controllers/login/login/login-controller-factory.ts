import { makeLogControllerDecorator } from '@/main/factories/decorators/log-controller-decorator-factory'
import { makeDbAutentication } from '@/main/factories/usecases/account/authetication/db-authetication-factory'

import { Controller } from '@/presentation/protocols'
import { LoginController } from '@/presentation/controllers/login/login/login-controller'

import { makeLoginValidation } from './login-validation-factory'

export const makeLoginController = (): Controller => {
  const dbAuthentication = makeDbAutentication()
  const loginValidation = makeLoginValidation()

  const loginController = new LoginController(dbAuthentication, loginValidation)

  return makeLogControllerDecorator(loginController)
}
