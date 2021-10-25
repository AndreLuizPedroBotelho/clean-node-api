import { LoadSurveyResultController } from '@/presentation/controllers'
import { InvalidParamError } from '@/presentation/errors'
import { CheckSurveyById, LoadSurveyResult } from '@/domain/usecases'
import { throwError, mockSurveyResultModel } from '@/tests/domain/mocks'
import { forbidden, ok, serverError } from '@/presentation/helpers'
import { mockCheckSurveyById, mockLoadSurveyResult } from '@/tests/presentation/mocks'
import MockDate from 'mockdate'

type LoadSurveyResultControllerTypes = {
  loadSurveyResultController: LoadSurveyResultController
  checkSurveyByIdStub: CheckSurveyById
  loadSurveyResultStub: LoadSurveyResult
}

const mockRequest = (): LoadSurveyResultController.Request => ({
  surveyId: 'any_survey_id',
  accountId: 'any_account_id'
})

const makeLoadSurveysResultController = (): LoadSurveyResultControllerTypes => {
  const checkSurveyByIdStub = mockCheckSurveyById()
  const loadSurveyResultStub = mockLoadSurveyResult()

  const loadSurveyResultController = new LoadSurveyResultController(checkSurveyByIdStub, loadSurveyResultStub)

  return {
    loadSurveyResultController,
    checkSurveyByIdStub,
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

  test('Should call CheckSurveyById with correct values', async () => {
    const {
      loadSurveyResultController,
      checkSurveyByIdStub
    } = makeLoadSurveysResultController()

    const checkSurveyByIdSpy = jest.spyOn(checkSurveyByIdStub, 'checkById')
    await loadSurveyResultController.handle(mockRequest())

    expect(checkSurveyByIdSpy).toHaveBeenCalledWith(mockRequest().surveyId)
  })

  test('Should return 403 if CheckSurveyById returns false', async () => {
    const {
      loadSurveyResultController,
      checkSurveyByIdStub
    } = makeLoadSurveysResultController()

    jest.spyOn(checkSurveyByIdStub, 'checkById').mockReturnValueOnce(Promise.resolve(false))

    const httpResponse = await loadSurveyResultController.handle(mockRequest())

    expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
  })

  test('Should return 500 if CheckSurveyById throws', async () => {
    const {
      loadSurveyResultController,
      checkSurveyByIdStub
    } = makeLoadSurveysResultController()

    jest.spyOn(checkSurveyByIdStub, 'checkById').mockImplementationOnce(throwError)

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

    expect(loadSurveyByIdSpy).toHaveBeenCalledWith(mockRequest().surveyId, mockRequest().accountId)
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
