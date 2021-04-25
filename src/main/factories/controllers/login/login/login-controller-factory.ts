import { makeLogControllerDecorator } from './../../../decorators/log-controller-decorator-factory'
import { Controller } from '../../../../../presentation/protocols'
import { LoginController } from '../../../../../presentation/controllers/login/login/login-controller'

import { makeLoginValidation } from './login-validation-factory'
import { makeDbAutentication } from '../../../usecases/account/authetication/db-authetication-factory'

export const makeLoginController = (): Controller => {
  const dbAuthentication = makeDbAutentication()
  const loginValidation = makeLoginValidation()

  const loginController = new LoginController(dbAuthentication, loginValidation)

  return makeLogControllerDecorator(loginController)
}
