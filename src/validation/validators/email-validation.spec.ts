import { mockEmailValidator } from '@/validation/test'

import { InvalidParamError } from '@/presentation/errors'
import { EmailValidator } from '@/validation/protocols/email-validator'
import { EmailValidation } from './email-validaton'

type EmailValidationTypes = {
  emailValidation: EmailValidation
  emailValidatorStub: EmailValidator
}

const makeEmailValidation = (): EmailValidationTypes => {
  const emailValidatorStub = mockEmailValidator()

  const emailValidation = new EmailValidation('email', emailValidatorStub)

  return {
    emailValidation,
    emailValidatorStub
  }
}
describe('Email Validation', () => {
  test('Should return 400 an error if EmailValidator returns false', () => {
    const { emailValidation, emailValidatorStub } = makeEmailValidation()

    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const error = emailValidation.validate({ email: 'any_email@mail.com' })

    expect(error).toEqual(new InvalidParamError('email'))
  })

  test('Should call EmailValidator with correct email', () => {
    const { emailValidation, emailValidatorStub } = makeEmailValidation()

    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    emailValidation.validate({ email: 'any_email@mail.com' })

    expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  test('Should throw if EmailValidator throws', () => {
    const { emailValidation, emailValidatorStub } = makeEmailValidation()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })

    expect(emailValidation.validate).toThrow()
  })
})
