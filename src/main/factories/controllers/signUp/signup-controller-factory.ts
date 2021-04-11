import { makeDbAddAccount } from './../../usecases/add-account/db-add-account-factory'
import { SignUpController } from '../../../../presentation/controllers/signup/signup-controller'
import { Controller } from '../../../../presentation/protocols'

import { makeSignUpValidation } from './signup-validation-factory'

import { makeDbAutentication } from '../../usecases/authetication/db-authetication-factory'
import { makeLogControllerDecorator } from '../../decorators/log-controller-decorator-factory'

export const makeSignUpController = (): Controller => {
  const dbAuthentication = makeDbAutentication()
  const dbAddAccount = makeDbAddAccount()
  const signUpValidation = makeSignUpValidation()

  const signUpController = new SignUpController(dbAddAccount, signUpValidation, dbAuthentication)

  return makeLogControllerDecorator(signUpController)
}
