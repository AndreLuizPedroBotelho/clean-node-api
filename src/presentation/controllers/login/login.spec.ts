import { InvalidParamError, MissingParamError } from '../../errors'
import { badRequest } from '../../helpers/http-helper'
import { EmailValidator, HttpRequest } from '../signup/signup-protocols'
import { LoginController } from './login'

const makeEMailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
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
}

const makeLoginController = (): LoginControllerTypes => {
  const emailValidatorStub = makeEMailValidator()

  const loginController = new LoginController(emailValidatorStub)

  return {
    loginController,
    emailValidatorStub
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
})
