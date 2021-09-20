import { makeDbAddAccount, makeDbAutentication } from '@/main/factories/usecases'
import { SignUpController } from '@/presentation/controllers'
import { Controller } from '@/presentation/protocols'

import { makeSignUpValidation } from './signup-validation-factory'

import { makeLogControllerDecorator } from '@/main/factories/decorators'

export const makeSignUpController = (): Controller => {
  const dbAuthentication = makeDbAutentication()
  const dbAddAccount = makeDbAddAccount()
  const signUpValidation = makeSignUpValidation()

  const signUpController = new SignUpController(dbAddAccount, signUpValidation, dbAuthentication)

  return makeLogControllerDecorator(signUpController)
}
