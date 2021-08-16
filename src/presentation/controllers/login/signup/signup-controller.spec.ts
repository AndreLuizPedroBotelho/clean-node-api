import { mockAuthentication, mockAddAccount } from '@/presentation/test'
import { mockValidation } from '@/validation/test'
import { throwError } from '@/domain/test'
import { MissingParamError, ServerError, EmailInUseError } from '@/presentation/errors'

import {
  AddAccount,
  Validation,
  Authentication,
  HttpRequest
} from './signup-controller-protocols'

import { SignUpController } from './signup-controller'
import { badRequest, ok, serverError, forbidden } from '@/presentation/helpers/http/http-helper'

type SignUpControllerTypes = {
  signUpController: SignUpController
  addAccountStub: AddAccount
  validationStub: Validation
  authenticationStub: Authentication
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password',
    passwordConfirmation: 'any_password'
  }
})

const makeSignUpController = (): SignUpControllerTypes => {
  const authenticationStub = mockAuthentication()
  const addAccountStub = mockAddAccount()
  const validationStub = mockValidation()

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
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(throwError)

    const httpResponse = await signUpController.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError(new ServerError('')))
  })

  test('Should return 403 if AddAccount returns null', async () => {
    const { signUpController, addAccountStub } = makeSignUpController()

    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
      return await Promise.resolve(null as any)
    })

    const httpResponse = await signUpController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(forbidden(new EmailInUseError()))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { signUpController } = makeSignUpController()

    const httpResponse = await signUpController.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok({ accessToken: 'any_token' }))
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

    jest.spyOn(authenticationStub, 'auth').mockImplementationOnce(throwError)

    const httpResponse = await signUpController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
