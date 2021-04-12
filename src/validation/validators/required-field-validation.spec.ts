import { MissingParamError } from '../../presentation/errors'
import { RequiredFieldValidation } from './required-field-validation'

const makeRequiredFieldValidation = (): RequiredFieldValidation => {
  return new RequiredFieldValidation('field')
}

describe('RequiredField Validation', () => {
  test('Should return a MissingParamError if validation fails', () => {
    const requiredFieldValidation = makeRequiredFieldValidation()

    const error = requiredFieldValidation.validate({ name: 'any_name' })

    expect(error).toEqual(new MissingParamError('field'))
  })

  test('Should not return  if validation succeeds', () => {
    const requiredFieldValidation = makeRequiredFieldValidation()

    const error = requiredFieldValidation.validate({ field: 'any_field' })

    expect(error).toBeFalsy()
  })
})
