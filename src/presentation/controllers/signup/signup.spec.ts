import { HttpRequest } from './../../protocols'
import { MissingParamError, ServerError } from '../../errors'

import { AddAccount, Validation, AddAccountModel, AccountModel } from './signup-protocols'
import { SignUpController } from './signup'
import { badRequest, ok, serverError } from '../../helpers/http/http-helper'

interface SignUpControllerTypes{
  signUpController: SignUpController
  addAccountStub: AddAccount
  validationStub: Validation
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
  const addAccountStub = makeAddAccount()
  const validationStub = makeValidation()

  const signUpController = new SignUpController(addAccountStub, validationStub)

  return {
    signUpController,
    addAccountStub,
    validationStub
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
})
