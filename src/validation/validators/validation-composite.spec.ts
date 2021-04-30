import { InvalidParamError, MissingParamError } from '@/presentation/errors'
import { Validation } from '@/presentation/protocols'
import { ValidationComposite } from './validation-composite'

interface ValidationCompositeTypes{
  validationComposite: ValidationComposite
  validationStubs: Validation[]
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
  const validationStubs = [
    makeValidationStub(),
    makeValidationStub()
  ]
  const validationComposite = new ValidationComposite(validationStubs)

  return {
    validationComposite,
    validationStubs
  }
}
describe('Validation Composite', () => {
  test('Should return an error if any validation fails', () => {
    const { validationComposite, validationStubs } = makeValidationComposite()
    jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(new MissingParamError('field'))

    const error = validationComposite.validate({ field: 'any_value' })

    expect(error).toEqual(new MissingParamError('field'))
  })

  test('Should return an error if more then one validation fails', () => {
    const { validationComposite, validationStubs } = makeValidationComposite()

    jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(new InvalidParamError('field'))
    jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(new MissingParamError('field'))

    const error = validationComposite.validate({ field: 'any_value' })

    expect(error).toEqual(new InvalidParamError('field'))
  })

  test('Should not return if validation succeeds', () => {
    const { validationComposite } = makeValidationComposite()

    const error = validationComposite.validate({ field: 'any_value' })

    expect(error).toBeFalsy()
  })
})
