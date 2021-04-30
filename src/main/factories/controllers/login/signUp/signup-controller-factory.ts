import { makeDbAddAccount } from '@/main/factories/usecases/account/add-account/db-add-account-factory'
import { SignUpController } from '@/presentation/controllers/login/signup/signup-controller'
import { Controller } from '@/presentation/protocols'

import { makeSignUpValidation } from './signup-validation-factory'

import { makeDbAutentication } from '@/main/factories/usecases/account/authetication/db-authetication-factory'
import { makeLogControllerDecorator } from '@/main/factories/decorators/log-controller-decorator-factory'

export const makeSignUpController = (): Controller => {
  const dbAuthentication = makeDbAutentication()
  const dbAddAccount = makeDbAddAccount()
  const signUpValidation = makeSignUpValidation()

  const signUpController = new SignUpController(dbAddAccount, signUpValidation, dbAuthentication)

  return makeLogControllerDecorator(signUpController)
}
