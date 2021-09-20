import { mockSurveyModels, throwError } from '@/domain/test'
import { mockLoadSurveys } from '@/presentation/test'

import { ok, noContent, serverError } from '@/presentation/helpers/http/http-helper'

import { LoadSurveysController } from './load-surveys-controller'
import { LoadSurveys, HttpRequest } from './load-surveys-controller-protocols'
import MockDate from 'mockdate'

const mockRequest = (): HttpRequest => ({ accountId: 'any_account_id' })

type LoadSurveyControllerTypes = {
  loadSurveysController: LoadSurveysController
  loadSurveysStub: LoadSurveys
}

const makeLoadSurveysController = (): LoadSurveyControllerTypes => {
  const loadSurveysStub = mockLoadSurveys()
  const loadSurveysController = new LoadSurveysController(loadSurveysStub)

  return {
    loadSurveysController,
    loadSurveysStub
  }
}

describe('LoadSurveys Controller', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call LoadSurveys with correct values', async () => {
    const { loadSurveysController, loadSurveysStub } = makeLoadSurveysController()

    const httpRequest = mockRequest()

    const loadSpy = jest.spyOn(loadSurveysStub, 'load')
    await loadSurveysController.handle(httpRequest)

    expect(loadSpy).toHaveBeenCalledWith(httpRequest.accountId)
  })

  test('Should return 200 on success', async () => {
    const { loadSurveysController } = makeLoadSurveysController()

    const httpResponse = await loadSurveysController.handle(mockRequest())

    expect(httpResponse).toEqual(ok(mockSurveyModels()))
  })

  test('Should return 204 if LoadSurveys returns empty', async () => {
    const { loadSurveysController, loadSurveysStub } = makeLoadSurveysController()

    jest.spyOn(loadSurveysStub, 'load').mockReturnValueOnce(Promise.resolve([]))

    const httpResponse = await loadSurveysController.handle(mockRequest())

    expect(httpResponse).toEqual(noContent())
  })

  test('Should return 500 if LoadSurveys throws', async () => {
    const { loadSurveysController, loadSurveysStub } = makeLoadSurveysController()

    jest.spyOn(loadSurveysStub, 'load').mockImplementationOnce(throwError)

    const httpResponse = await loadSurveysController.handle(mockRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
