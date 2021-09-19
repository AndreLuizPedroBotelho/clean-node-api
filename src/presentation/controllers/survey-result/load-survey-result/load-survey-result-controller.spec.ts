import { throwError } from '@/domain/test'
import { forbidden, serverError } from '@/presentation/helpers/http/http-helper'
import { mockLoadSurveyById } from '@/presentation/test/'

import {
  HttpRequest,
  SaveSurveyResultParams,
  LoadSurveyById,
  InvalidParamError
} from './load-survey-result-controller-protocols'

import { LoadSurveyResultController } from './load-survey-result-controller'

type LoadSurveyResultControllerTypes = {
  loadSurveyResultController: LoadSurveyResultController
  loadSurveyByIdStub: LoadSurveyById
}

const makeFakeSurveyResultData = (): Omit<SaveSurveyResultParams, 'surveyId' | 'accountId'> => ({
  answer: 'any_answer',
  date: new Date()
})

const makeFakeRequest = (): HttpRequest => ({
  params: {
    surveyId: 'any_survey_id'
  },
  body: makeFakeSurveyResultData(),
  accountId: 'any_account_id'
})

const makeLoadSurveysResultController = (): LoadSurveyResultControllerTypes => {
  const loadSurveyByIdStub = mockLoadSurveyById()

  const loadSurveyResultController = new LoadSurveyResultController(loadSurveyByIdStub)

  return {
    loadSurveyResultController,
    loadSurveyByIdStub
  }
}

describe('LoadSurveyResult Controller', () => {
  test('Should call LoadSurveyById with correct values', async () => {
    const {
      loadSurveyResultController,
      loadSurveyByIdStub
    } = makeLoadSurveysResultController()

    const loadSurveyByIdSpy = jest.spyOn(loadSurveyByIdStub, 'loadById')
    await loadSurveyResultController.handle(makeFakeRequest())

    expect(loadSurveyByIdSpy).toHaveBeenCalledWith('any_survey_id')
  })

  test('Should return 403 if LoadSurveyById returns null', async () => {
    const {
      loadSurveyResultController,
      loadSurveyByIdStub
    } = makeLoadSurveysResultController()

    jest.spyOn(loadSurveyByIdStub, 'loadById').mockReturnValueOnce(Promise.resolve(null as any))

    const httpResponse = await loadSurveyResultController.handle(makeFakeRequest())

    expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
  })

  test('Should return 500 if LoadSurveyById throws', async () => {
    const {
      loadSurveyResultController,
      loadSurveyByIdStub
    } = makeLoadSurveysResultController()

    jest.spyOn(loadSurveyByIdStub, 'loadById').mockImplementationOnce(throwError)

    jest.spyOn(loadSurveyByIdStub, 'loadById').mockReturnValueOnce(Promise.resolve(null as any))

    const httpResponse = await loadSurveyResultController.handle(makeFakeRequest())

    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
