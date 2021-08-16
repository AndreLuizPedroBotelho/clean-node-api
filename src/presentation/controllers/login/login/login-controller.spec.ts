import { mockAuthentication } from '@/presentation/test'
import { mockValidation } from '@/validation/test'
import { throwError } from '@/domain/test'
import { HttpRequest, Authentication, Validation } from './login-controller-protocols'
import { MissingParamError } from '@/presentation/errors'
import { badRequest, ok, serverError, unauthorized } from '@/presentation/helpers/http/http-helper'
import { LoginController } from './login-controller'

type LoginControllerTypes = {
  loginController: LoginController
  authenticationStub: Authentication
  validationStub: Validation
}

const mockRequest = (): HttpRequest => ({
  body: {
    email: 'any_email@mail.com',
    password: 'any_password'
  }
})

const makeLoginController = (): LoginControllerTypes => {
  const authenticationStub = mockAuthentication()
  const validationStub = mockValidation()

  const loginController = new LoginController(authenticationStub, validationStub)

  return {
    loginController,
    authenticationStub,
    validationStub
  }
}

describe('Login Controller', () => {
  test('Should call Authentication with correct values', async () => {
    const { loginController, authenticationStub } = makeLoginController()

    const authSpy = jest.spyOn(authenticationStub, 'auth')

    await loginController.handle(mockRequest())
    expect(authSpy).toHaveBeenCalledWith({
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })

  test('Should return 401 if invalid credentials are provided', async () => {
    const { loginController, authenticationStub } = makeLoginController()

    jest.spyOn(authenticationStub, 'auth').mockResolvedValueOnce(Promise.resolve(null as unknown as string))

    const httpResponse = await loginController.handle(mockRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 500 if Authentication throws', async () => {
    const { loginController, authenticationStub } = makeLoginController()

    jest.spyOn(authenticationStub, 'auth').mockImplementationOnce(throwError)

    const httpResponse = await loginController.handle(mockRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 if valid credentials are provided', async () => {
    const { loginController } = makeLoginController()

    const httpResponse = await loginController.handle(mockRequest())

    expect(httpResponse).toEqual(ok({ accessToken: 'any_token' }))
  })

  test('Should call Validation with correct values', async () => {
    const { loginController, validationStub } = makeLoginController()

    const validateSpy = jest.spyOn(validationStub, 'validate')

    const httpRequest = mockRequest()
    await loginController.handle(httpRequest)

    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { loginController, validationStub } = makeLoginController()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('any_field'))

    const httpResponse = await loginController.handle(mockRequest())

    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })
})
