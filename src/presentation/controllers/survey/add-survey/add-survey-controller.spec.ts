import { AddSurveyController } from './add-survey-controller'
import { HttpRequest, Validation } from './add-survey-controller-protocols'

interface AddSurveyControllerTypes{
  addSurveyController: AddSurveyController
  validationStub: Validation
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    question: 'any_question',
    answers: [{
      image: 'any_image',
      answer: 'any_answer'
    }]
  }
})

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error {
      return null as unknown as Error
    }
  }

  return new ValidationStub()
}

const makeAddSurveyController = (): AddSurveyControllerTypes => {
  const validationStub = makeValidation()

  const addSurveyController = new AddSurveyController(validationStub)

  return {
    addSurveyController,
    validationStub
  }
}

describe('AddSurvey Controller', () => {
  test('Should can validation with correct values', async () => {
    const { addSurveyController, validationStub } = makeAddSurveyController()
    const httpRequest = makeFakeRequest()
    const validateSpy = jest.spyOn(validationStub, 'validate')

    await addSurveyController.handle(httpRequest)
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })
})
