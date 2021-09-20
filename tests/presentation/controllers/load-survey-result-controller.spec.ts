import { LoadSurveyResultController } from '@/presentation/controllers'
import { InvalidParamError } from '@/presentation/errors'
import { SaveSurveyResultParams, LoadSurveyById, LoadSurveyResult } from '@/domain/usecases'
import { HttpRequest } from '@/presentation/protocols'
import { throwError, mockSurveyResultModel } from '@/tests/domain/mocks'
import { forbidden, ok, serverError } from '@/presentation/helpers'
import { mockLoadSurveyById, mockLoadSurveyResult } from '@/tests/presentation/mocks'
import MockDate from 'mockdate'

type LoadSurveyResultControllerTypes = {
  loadSurveyResultController: LoadSurveyResultController
  loadSurveyByIdStub: LoadSurveyById
  loadSurveyResultStub: LoadSurveyResult
}

const mockSurveyResultData = (): Omit<SaveSurveyResultParams, 'surveyId' | 'accountId'> => ({
  answer: 'any_answer',
  date: new Date()
})

const mockRequest = (): HttpRequest => ({
  params: {
    surveyId: 'any_survey_id'
  },
  body: mockSurveyResultData(),
  accountId: 'any_account_id'
})

const makeLoadSurveysResultController = (): LoadSurveyResultControllerTypes => {
  const loadSurveyByIdStub = mockLoadSurveyById()
  const loadSurveyResultStub = mockLoadSurveyResult()

  const loadSurveyResultController = new LoadSurveyResultController(loadSurveyByIdStub, loadSurveyResultStub)

  return {
    loadSurveyResultController,
    loadSurveyByIdStub,
    loadSurveyResultStub
  }
}

describe('LoadSurveyResult Controller', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call LoadSurveyById with correct values', async () => {
    const {
      loadSurveyResultController,
      loadSurveyByIdStub
    } = makeLoadSurveysResultController()

    const loadSurveyByIdSpy = jest.spyOn(loadSurveyByIdStub, 'loadById')
    await loadSurveyResultController.handle(mockRequest())

    expect(loadSurveyByIdSpy).toHaveBeenCalledWith('any_survey_id')
  })

  test('Should return 403 if LoadSurveyById returns null', async () => {
    const {
      loadSurveyResultController,
      loadSurveyByIdStub
    } = makeLoadSurveysResultController()

    jest.spyOn(loadSurveyByIdStub, 'loadById').mockReturnValueOnce(Promise.resolve(null))

    const httpResponse = await loadSurveyResultController.handle(mockRequest())

    expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
  })

  test('Should return 500 if LoadSurveyById throws', async () => {
    const {
      loadSurveyResultController,
      loadSurveyByIdStub
    } = makeLoadSurveysResultController()

    jest.spyOn(loadSurveyByIdStub, 'loadById').mockImplementationOnce(throwError)

    const httpResponse = await loadSurveyResultController.handle(mockRequest())

    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should call LoadSurveyResult with correct values', async () => {
    const {
      loadSurveyResultController,
      loadSurveyResultStub
    } = makeLoadSurveysResultController()

    const loadSurveyByIdSpy = jest.spyOn(loadSurveyResultStub, 'load')
    await loadSurveyResultController.handle(mockRequest())

    expect(loadSurveyByIdSpy).toHaveBeenCalledWith('any_survey_id', 'any_account_id')
  })

  test('Should return 500 if LoadSurveyResult throws', async () => {
    const {
      loadSurveyResultController,
      loadSurveyResultStub
    } = makeLoadSurveysResultController()

    jest.spyOn(loadSurveyResultStub, 'load').mockImplementationOnce(throwError)

    const httpResponse = await loadSurveyResultController.handle(mockRequest())

    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 on success', async () => {
    const {
      loadSurveyResultController
    } = makeLoadSurveysResultController()

    const httpResponse = await loadSurveyResultController.handle(mockRequest())

    expect(httpResponse).toEqual(ok(mockSurveyResultModel()))
  })
})
