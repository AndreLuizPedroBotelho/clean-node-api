import { InvalidParamError } from '@/presentation/errors'
import { LoadAnswersBySurvey, SaveSurveyResult } from '@/domain/usecases'
import { SaveSurveyResultController } from '@/presentation/controllers'
import { mockSaveSurveyResult, mockLoadAnswersBySurvey } from '@/tests/presentation/mocks'
import { throwError, mockSurveyResultModel, mockSurveyResultParams } from '@/tests/domain/mocks'
import { forbidden, serverError, ok } from '@/presentation/helpers'

import MockDate from 'mockdate'

type SaveSurveyResultControllerTypes = {
  saveSurveyResultController: SaveSurveyResultController
  saveSurveyResultStub: SaveSurveyResult
  loadAnswersBySurveyStub: LoadAnswersBySurvey
}

const mockRequest = (): SaveSurveyResultController.Request => ({
  surveyId: 'any_survey_id',
  answer: 'any_answer',
  accountId: 'any_account_id'
})

const makeSaveSurveysResultController = (): SaveSurveyResultControllerTypes => {
  const saveSurveyResultStub = mockSaveSurveyResult()
  const loadAnswersBySurveyStub = mockLoadAnswersBySurvey()

  const saveSurveyResultController = new SaveSurveyResultController(loadAnswersBySurveyStub, saveSurveyResultStub)

  return {
    saveSurveyResultController,
    saveSurveyResultStub,
    loadAnswersBySurveyStub
  }
}

describe('SaveSurveyResult Controller', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call LoadAnswerBySurvey', async () => {
    const {
      saveSurveyResultController,
      loadAnswersBySurveyStub
    } = makeSaveSurveysResultController()

    const loadAnswerBySurveySpy = jest.spyOn(loadAnswersBySurveyStub, 'loadAnswers')
    await saveSurveyResultController.handle(mockRequest())

    expect(loadAnswerBySurveySpy).toHaveBeenCalledWith(mockRequest().surveyId)
  })

  test('Should return 403 if LoadAnswerBySurvey returns null', async () => {
    const {
      saveSurveyResultController,
      loadAnswersBySurveyStub
    } = makeSaveSurveysResultController()

    jest
      .spyOn(loadAnswersBySurveyStub, 'loadAnswers')
      .mockReturnValueOnce(Promise.resolve([]))

    const httpResponse = await saveSurveyResultController.handle(mockRequest())

    expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
  })

  test('Should return 403 if an invalid answer is provided', async () => {
    const {
      saveSurveyResultController
    } = makeSaveSurveysResultController()

    const request: SaveSurveyResultController.Request = {
      answer: 'wrong_answer',
      surveyId: 'any_survey_id',
      accountId: 'any_account_id'
    }

    delete request.accountId
    const httpResponse = await saveSurveyResultController.handle(request)

    expect(httpResponse).toEqual(forbidden(new InvalidParamError('answer')))
  })

  test('Should return 500 if LoadAnswerBySurvey throws', async () => {
    const {
      saveSurveyResultController,
      loadAnswersBySurveyStub
    } = makeSaveSurveysResultController()

    jest.spyOn(loadAnswersBySurveyStub, 'loadAnswers').mockImplementationOnce(throwError)

    const httpResponse = await saveSurveyResultController.handle(mockRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should call SaveSurveyResult', async () => {
    const {
      saveSurveyResultController,
      saveSurveyResultStub
    } = makeSaveSurveysResultController()

    const saveSpy = jest.spyOn(saveSurveyResultStub, 'save')
    await saveSurveyResultController.handle(mockRequest())

    expect(saveSpy).toHaveBeenCalledWith(mockSurveyResultParams())
  })

  test('Should return 500 if SaveSurveyResult throws', async () => {
    const {
      saveSurveyResultController,
      saveSurveyResultStub
    } = makeSaveSurveysResultController()

    jest.spyOn(saveSurveyResultStub, 'save').mockImplementationOnce(throwError)

    const httpResponse = await saveSurveyResultController.handle(mockRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 on success', async () => {
    const {
      saveSurveyResultController
    } = makeSaveSurveysResultController()

    const httpResponse = await saveSurveyResultController.handle(mockRequest())
    expect(httpResponse).toEqual(ok(mockSurveyResultModel()))
  })
})
