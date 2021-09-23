import { InvalidParamError } from '@/presentation/errors'
import { LoadSurveyById, SaveSurveyResult } from '@/domain/usecases'
import { SaveSurveyResultController } from '@/presentation/controllers'
import { mockSaveSurveyResult, mockLoadSurveyById } from '@/tests/presentation/mocks'
import { throwError, mockSurveyResultModel, mockSurveyResultParams } from '@/tests/domain/mocks'
import { forbidden, serverError, ok } from '@/presentation/helpers'

import MockDate from 'mockdate'

type SaveSurveyResultControllerTypes = {
  saveSurveyResultController: SaveSurveyResultController
  saveSurveyResultStub: SaveSurveyResult
  loadSurveyByIdStub: LoadSurveyById
}

const mockRequest = (): SaveSurveyResultController.Request => ({
  surveyId: 'any_survey_id',
  answer: 'any_answer',
  accountId: 'any_account_id'
})

const makeSaveSurveysResultController = (): SaveSurveyResultControllerTypes => {
  const saveSurveyResultStub = mockSaveSurveyResult()
  const loadSurveyByIdStub = mockLoadSurveyById()

  const saveSurveyResultController = new SaveSurveyResultController(loadSurveyByIdStub, saveSurveyResultStub)

  return {
    saveSurveyResultController,
    saveSurveyResultStub,
    loadSurveyByIdStub
  }
}

describe('SaveSurveyResult Controller', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call LoadSurveyById', async () => {
    const {
      saveSurveyResultController,
      loadSurveyByIdStub
    } = makeSaveSurveysResultController()

    const loadSurveyByIdSpy = jest.spyOn(loadSurveyByIdStub, 'loadById')
    await saveSurveyResultController.handle(mockRequest())

    expect(loadSurveyByIdSpy).toHaveBeenCalledWith(mockRequest().surveyId)
  })

  test('Should return 403 if LoadSurveyById returns null', async () => {
    const {
      saveSurveyResultController,
      loadSurveyByIdStub
    } = makeSaveSurveysResultController()

    jest
      .spyOn(loadSurveyByIdStub, 'loadById')
      .mockReturnValueOnce(Promise.resolve(null))

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

    expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
  })

  test('Should return 500 if LoadSurveyById throws', async () => {
    const {
      saveSurveyResultController,
      loadSurveyByIdStub
    } = makeSaveSurveysResultController()

    jest.spyOn(loadSurveyByIdStub, 'loadById').mockImplementationOnce(throwError)

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
