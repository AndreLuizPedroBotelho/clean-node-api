import { Validation } from '@/presentation/protocols'
import { AddAccount, Authentication } from '@/domain/usecases'
import { SignUpController } from '@/presentation/controllers'
import { mockAuthentication, mockAddAccount } from '@/tests/presentation/mocks'
import { mockValidation } from '@/tests/validation/mocks'
import { throwError, mockAuthenticationModel } from '@/tests/domain/mocks'
import { MissingParamError, ServerError, EmailInUseError } from '@/presentation/errors'

import { badRequest, ok, serverError, forbidden } from '@/presentation/helpers'

type SignUpControllerTypes = {
  signUpController: SignUpController
  addAccountStub: AddAccount
  validationStub: Validation
  authenticationStub: Authentication
}

const mockRequest = (): SignUpController.Request => ({
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'any_password',
  passwordConfirmation: 'any_password'
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

    await signUpController.handle(mockRequest())

    const { name, email, password } = mockRequest()

    expect(addSpy).toHaveBeenCalledWith({ name, email, password })
  })

  test('Should return 500 if AddAccount throws', async () => {
    const { signUpController, addAccountStub } = makeSignUpController()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(throwError)

    const httpResponse = await signUpController.handle(mockRequest())

    expect(httpResponse).toEqual(serverError(new ServerError('')))
  })

  test('Should return 403 if AddAccount returns null', async () => {
    const { signUpController, addAccountStub } = makeSignUpController()

    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
      return await Promise.resolve(null)
    })

    const httpResponse = await signUpController.handle(mockRequest())
    expect(httpResponse).toEqual(forbidden(new EmailInUseError()))
  })

  test('Should return 200 if valid data is provided', async () => {
    const { signUpController } = makeSignUpController()

    const httpResponse = await signUpController.handle(mockRequest())

    expect(httpResponse).toEqual(ok(mockAuthenticationModel()))
  })

  test('Should call Validation with correct values', async () => {
    const { signUpController, validationStub } = makeSignUpController()

    const validateSpy = jest.spyOn(validationStub, 'validate')

    const request = mockRequest()
    await signUpController.handle(request)

    expect(validateSpy).toHaveBeenCalledWith(request)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { signUpController, validationStub } = makeSignUpController()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))

    const httpResponse = await signUpController.handle(mockRequest())

    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })

  test('Should call Authentication with correct values', async () => {
    const { signUpController, authenticationStub } = makeSignUpController()

    const authSpy = jest.spyOn(authenticationStub, 'auth')

    await signUpController.handle(mockRequest())

    const { email, password } = mockRequest()

    expect(authSpy).toHaveBeenCalledWith({
      email,
      password
    })
  })

  test('Should return 500 if Authentication throws', async () => {
    const { signUpController, authenticationStub } = makeSignUpController()

    jest.spyOn(authenticationStub, 'auth').mockImplementationOnce(throwError)

    const httpResponse = await signUpController.handle(mockRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
