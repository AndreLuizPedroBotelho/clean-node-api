import { MissingParamError } from '../../errors'
import { RequiredFieldValidation } from './required-field-validation'

interface RequiredFieldValidationypes{
  requiredFieldValidation: RequiredFieldValidation
}

const makeRequiredFieldValidation = (): RequiredFieldValidationypes => {
  const requiredFieldValidation = new RequiredFieldValidation('field')

  return {
    requiredFieldValidation
  }
}

describe('RequiredField Validation', () => {
  test('Should return a MissingParamError if validation fails', () => {
    const { requiredFieldValidation } = makeRequiredFieldValidation()

    const error = requiredFieldValidation.validate({ name: 'any_name' })

    expect(error).toEqual(new MissingParamError('field'))
  })
})
