import { MissingParamError, ServerError } from '../../errors'

import {
  AddAccount,
  Validation,
  AddAccountModel,
  AccountModel,
  Authentication,
  AuthenticationModel,
  HttpRequest
} from './signup-controller-protocols'

import { SignUpController } from './signup-controller'
import { badRequest, ok, serverError } from '../../helpers/http/http-helper'

interface SignUpControllerTypes{
  signUpController: SignUpController
  addAccountStub: AddAccount
  validationStub: Validation
  authenticationStub: Authentication
}

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
})

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password',
    passwordConfirmation: 'any_password'
  }
})
const makeAuthentication = (): Authentication => {
  class AuthenticationStub implements Authentication {
    async auth (authentication: AuthenticationModel): Promise<string> {
      return await new Promise(resolve => resolve('any_token'))
    }
  }

  return new AuthenticationStub()
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add (account: AddAccountModel): Promise<AccountModel> {
      return await new Promise(resolve => resolve(makeFakeAccount()))
    }
  }

  return new AddAccountStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error {
      return null as unknown as Error
    }
  }

  return new ValidationStub()
}

const makeSignUpController = (): SignUpControllerTypes => {
  const authenticationStub = makeAuthentication()
  const addAccountStub = makeAddAccount()
  const validationStub = makeValidation()

  const signUpController = new SignUpController(
    addAccountStub,
    validationStub,
    authenticationStub
  )

  return {
    signUpController,
    addAccountStub,
    validationStub,
    authenticationStub
  }
}
describe('SignUp Controller', () => {
  test('Should call AddAccount with correct values', async () => {
    const { signUpController, addAccountStub } = makeSignUpController()

    const addSpy = jest.spyOn(addAccountStub, 'add')

    await signUpController.handle(makeFakeRequest())

    expect(addSpy).toHaveBeenCalledWith({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })

  test('Should return 500 if AddAccount throws', async () => {
    const { signUpController, addAccountStub } = makeSignUpController()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
      return await new Promise((resolve, reject) => reject(new Error()))
    })

    const httpResponse = await signUpController.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError(new ServerError('')))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { signUpController } = makeSignUpController()

    const httpResponse = await signUpController.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok(makeFakeAccount()))
  })

  test('Should call Validation with correct values', async () => {
    const { signUpController, validationStub } = makeSignUpController()

    const validateSpy = jest.spyOn(validationStub, 'validate')

    const httpRequest = makeFakeRequest()
    await signUpController.handle(httpRequest)

    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { signUpController, validationStub } = makeSignUpController()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))

    const httpResponse = await signUpController.handle(makeFakeRequest())

    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })

  test('Should call Authentication with correct values', async () => {
    const { signUpController, authenticationStub } = makeSignUpController()

    const authSpy = jest.spyOn(authenticationStub, 'auth')

    await signUpController.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith({
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })

  test('Should return 500 if Authentication throws', async () => {
    const { signUpController, authenticationStub } = makeSignUpController()

    jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(new Promise((resolve, reject) =>
      reject(new Error())
    ))

    const httpResponse = await signUpController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
