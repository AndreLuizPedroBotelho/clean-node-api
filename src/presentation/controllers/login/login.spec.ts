import { HttpRequest, EmailValidator, Authentication } from './login-protocols'
import { InvalidParamError, MissingParamError } from '../../errors'
import { badRequest, serverError, unauthorized } from '../../helpers/http-helper'
import { LoginController } from './login'

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

const makeAuthentication = (): Authentication => {
  class AuthenticationStub implements Authentication {
    async auth (email: string, password: string): Promise<string> {
      return await new Promise(resolve => resolve('any_token'))
    }
  }

  return new AuthenticationStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    email: 'any_email@mail.com',
    password: 'any_password'
  }
})
interface LoginControllerTypes{
  loginController: LoginController
  emailValidatorStub: EmailValidator
  authenticationStub: Authentication
}

const makeLoginController = (): LoginControllerTypes => {
  const emailValidatorStub = makeEmailValidator()
  const authenticationStub = makeAuthentication()

  const loginController = new LoginController(emailValidatorStub, authenticationStub)

  return {
    loginController,
    emailValidatorStub,
    authenticationStub

  }
}
describe('Login Controller', () => {
  test('Should return 400 if no email is provided ', async () => {
    const { loginController } = makeLoginController()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }

    const httpResponse = await loginController.handle(httpRequest)

    expect(httpResponse).toEqual(badRequest(new MissingParamError('email')))
  })

  test('Should return 400 if no password is provided ', async () => {
    const { loginController } = makeLoginController()

    const httpRequest = {
      body: {
        email: 'any_email@mail.com'
      }
    }

    const httpResponse = await loginController.handle(httpRequest)

    expect(httpResponse).toEqual(badRequest(new MissingParamError('password')))
  })

  test('Should call EmailValidator with correct email ', async () => {
    const { loginController, emailValidatorStub } = makeLoginController()
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    await loginController.handle(makeFakeRequest())
    expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  test('Should return 400 if an invalid email is provided', async () => {
    const { loginController, emailValidatorStub } = makeLoginController()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const httpResponse = await loginController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')))
  })

  test('Should return 500 if EmailValidator throws', async () => {
    const { loginController, emailValidatorStub } = makeLoginController()

    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })

    const httpResponse = await loginController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should call Authentication with correct values', async () => {
    const { loginController, authenticationStub } = makeLoginController()

    const authSpy = jest.spyOn(authenticationStub, 'auth')

    await loginController.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith('any_email@mail.com', 'any_password')
  })

  test('Should return 401 if invalid credentials are provided', async () => {
    const { loginController, authenticationStub } = makeLoginController()

    jest.spyOn(authenticationStub, 'auth').mockResolvedValueOnce(new Promise(resolve => resolve(null as unknown as string)))

    const httpResponse = await loginController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(unauthorized())
  })

  test('Should return 500 if Authentication throws', async () => {
    const { loginController, authenticationStub } = makeLoginController()

    jest.spyOn(authenticationStub, 'auth').mockReturnValueOnce(new Promise((resolve, reject) =>
      reject(new Error())
    ))

    const httpResponse = await loginController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
