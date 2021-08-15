import { mockValidation } from '@/validation/test'
import { mockAddSurvey } from '@/presentation/test'
import { throwError } from '@/domain/test'
import { badRequest, noContent, serverError } from '@/presentation/helpers/http/http-helper'
import { AddSurveyController } from './add-survey-controller'
import { HttpRequest, Validation, AddSurvey } from './add-survey-controller-protocols'
import MockDate from 'mockdate'

type AddSurveyControllerTypes = {
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
    }],
    date: new Date()
  }
})

const makeAddSurveyController = (): AddSurveyControllerTypes => {
  const validationStub = mockValidation()
  const addSurveyStub = mockAddSurvey()

  const addSurveyController = new AddSurveyController(validationStub, addSurveyStub)

  return {
    addSurveyController,
    validationStub,
    addSurveyStub
  }
}

describe('AddSurvey Controller', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

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

    jest.spyOn(addSurveyStub, 'add').mockImplementationOnce(throwError)

    const httpResponse = await addSurveyController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 204 on success', async () => {
    const { addSurveyController } = makeAddSurveyController()

    const httpResponse = await addSurveyController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(noContent())
  })
})
