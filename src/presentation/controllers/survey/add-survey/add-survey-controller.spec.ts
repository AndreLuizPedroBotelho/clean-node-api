import { badRequest, noContent, serverError } from '../../../helpers/http/http-helper'
import { AddSurveyController } from './add-survey-controller'
import { HttpRequest, Validation, AddSurvey, AddSurveyModel } from './add-survey-controller-protocols'

interface AddSurveyControllerTypes{
  addSurveyController: AddSurveyController
  validationStub: Validation
  addSurveyStub: AddSurvey
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

const makeAddSurvey = (): AddSurvey => {
  class AddSurveyStub implements AddSurvey {
    async add (data: AddSurveyModel): Promise<void> {
      return await new Promise(resolve => resolve())
    }
  }

  return new AddSurveyStub()
}

const makeAddSurveyController = (): AddSurveyControllerTypes => {
  const validationStub = makeValidation()
  const addSurveyStub = makeAddSurvey()

  const addSurveyController = new AddSurveyController(validationStub, addSurveyStub)

  return {
    addSurveyController,
    validationStub,
    addSurveyStub
  }
}

describe('AddSurvey Controller', () => {
  test('Should can validation with correct values', async () => {
    const { addSurveyController, validationStub } = makeAddSurveyController()
    const httpRequest = makeFakeRequest()
    const validateSpy = jest.spyOn(validationStub, 'validate')

    await addSurveyController.handle(makeFakeRequest())
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 400 if Validation fails', async () => {
    const { addSurveyController, validationStub } = makeAddSurveyController()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error())

    const httpResponse = await addSurveyController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(badRequest(new Error()))
  })

  test('Should call AddSurvey with correct values', async () => {
    const { addSurveyController, addSurveyStub } = makeAddSurveyController()
    const httpRequest = makeFakeRequest()
    const addSurveySpy = jest.spyOn(addSurveyStub, 'add')

    await addSurveyController.handle(makeFakeRequest())
    expect(addSurveySpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 500 if AddSurvey throws', async () => {
    const { addSurveyController, addSurveyStub } = makeAddSurveyController()

    jest.spyOn(addSurveyStub, 'add').mockReturnValueOnce(new Promise((resolve, reject) =>
      reject(new Error())
    ))

    const httpResponse = await addSurveyController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 204 on success', async () => {
    const { addSurveyController } = makeAddSurveyController()

    const httpResponse = await addSurveyController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(noContent())
  })
})
