import { AddSurveyController } from '@/presentation/controllers'
import { mockValidation } from '@/tests/validation/mocks'
import { mockAddSurvey } from '@/tests/presentation/mocks'

import { AddSurvey } from '@/domain/usecases'
import { Validation } from '@/presentation/protocols'
import { throwError } from '@/tests/domain/mocks'
import { badRequest, noContent, serverError } from '@/presentation/helpers'
import MockDate from 'mockdate'

type AddSurveyControllerTypes = {
  addSurveyController: AddSurveyController
  validationStub: Validation
  addSurveyStub: AddSurvey
}

const mockRequest = (): AddSurveyController.Request => ({
  question: 'any_question',
  answers: [{
    image: 'any_image',
    answer: 'any_answer'
  }]
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
    const request = mockRequest()
    const validateSpy = jest.spyOn(validationStub, 'validate')

    await addSurveyController.handle(mockRequest())
    expect(validateSpy).toHaveBeenCalledWith(request)
  })

  test('Should return 400 if Validation fails', async () => {
    const { addSurveyController, validationStub } = makeAddSurveyController()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error())

    const httpResponse = await addSurveyController.handle(mockRequest())
    expect(httpResponse).toEqual(badRequest(new Error()))
  })

  test('Should call AddSurvey with correct values', async () => {
    const { addSurveyController, addSurveyStub } = makeAddSurveyController()
    const request = mockRequest()
    const addSurveySpy = jest.spyOn(addSurveyStub, 'add')

    await addSurveyController.handle(mockRequest())
    expect(addSurveySpy).toHaveBeenCalledWith({ ...request, date: new Date() })
  })

  test('Should return 500 if AddSurvey throws', async () => {
    const { addSurveyController, addSurveyStub } = makeAddSurveyController()

    jest.spyOn(addSurveyStub, 'add').mockImplementationOnce(throwError)

    const httpResponse = await addSurveyController.handle(mockRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 204 on success', async () => {
    const { addSurveyController } = makeAddSurveyController()

    const httpResponse = await addSurveyController.handle(mockRequest())
    expect(httpResponse).toEqual(noContent())
  })
})
