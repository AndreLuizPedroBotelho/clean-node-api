import { EmailValidatorAdapter } from './email-validator-adapter'
import validator from 'validator'

jest.mock('validator', () => ({
  isEmail (): boolean {
    return true
  }
}))

const makeEmailValidatorAdapter = (): EmailValidatorAdapter => {
  return new EmailValidatorAdapter()
}

describe('EmailValidator Adapter', () => {
  test('Should return false if validator returns false', async () => {
    const emailValidatorAdapter = makeEmailValidatorAdapter()

    jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)

    const isValid = emailValidatorAdapter.isValid('invalid_email@mail.com')

    expect(isValid).toBe(false)
  })

  test('Should return true if validator returns true', async () => {
    const emailValidatorAdapter = makeEmailValidatorAdapter()
    const isValid = emailValidatorAdapter.isValid('valid_email@mail.com')

    expect(isValid).toBe(true)
  })

  test('Should call validator with correct email', async () => {
    const emailValidatorAdapter = makeEmailValidatorAdapter()
    const isEmail = jest.spyOn(validator, 'isEmail')

    emailValidatorAdapter.isValid('valid_email@mail.com')

    expect(isEmail).toHaveBeenCalledWith('valid_email@mail.com')
  })
})
