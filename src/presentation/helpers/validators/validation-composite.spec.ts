import { MissingParamError } from '../../errors'
import { Validation } from './validation'
import { ValidationComposite } from './validation-composite'

interface ValidationCompositeTypes{
  validationComposite: ValidationComposite
  validationStub: Validation
}
const makeValidationStub = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error {
      return null as unknown as Error
    }
  }

  return new ValidationStub()
}
const makeValidationComposite = (): ValidationCompositeTypes => {
  const validationStub = makeValidationStub()
  const validationComposite = new ValidationComposite([validationStub])

  return {
    validationComposite,
    validationStub
  }
}
describe('Validation Composite', () => {
  test('Should return an error if any validation fails', () => {
    const { validationComposite, validationStub } = makeValidationComposite()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new MissingParamError('field'))

    const error = validationComposite.validate({ field: 'any_value' })

    expect(error).toEqual(new MissingParamError('field'))
  })
})
