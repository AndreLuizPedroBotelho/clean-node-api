import { InvalidParamError } from '@/presentation/errors'
import { CompareFieldsValidation } from '@/validation/validators'

const makeCompareFieldsValidation = (): CompareFieldsValidation => {
  return new CompareFieldsValidation('field', 'fieldToCompare')
}

describe('CompareFields Validation', () => {
  test('Should return a MissingParamError if validation fails', () => {
    const requiredFieldValidation = makeCompareFieldsValidation()

    const error = requiredFieldValidation.validate({
      field: 'any_field',
      fieldToCompare: 'any_field_incorrect'
    })

    expect(error).toEqual(new InvalidParamError('fieldToCompare'))
  })

  test('Should not return  if validation succeeds', () => {
    const requiredFieldValidation = makeCompareFieldsValidation()

    const error = requiredFieldValidation.validate({ field: 'any_field', fieldToCompare: 'any_field' })

    expect(error).toBeFalsy()
  })
})
