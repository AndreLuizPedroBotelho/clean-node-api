import { forbidden, serverError, ok } from '@/presentation/helpers/http/http-helper'
import { SaveSurveyResultController } from './save-survey-result-controller'
import {
  SaveSurveyResult,
  SurveyResultModel,
  SaveSurveyResultParams,
  HttpRequest,
  SurveyModel,
  LoadSurveyById,
  InvalidParamError
} from './save-survey-result-controller-protocols'

import MockDate from 'mockdate'

type SaveSurveyResultControllerTypes = {
  saveSurveyResultController: SaveSurveyResultController
  saveSurveyResultStub: SaveSurveyResult
  loadSurveyByIdStub: LoadSurveyById
}

const makeFakeSurvey = (): SurveyModel => (
  {
    id: 'any_survey_id',
    question: 'any_question',
    answers: [{
      image: 'any_image',
      answer: 'any_answer'
    }],
    date: new Date()
  }
)

const makeFakeSurveyResultData = (): Omit<SaveSurveyResultParams, 'surveyId'| 'accountId'> => ({
  answer: 'any_answer',
  date: new Date()
})

const makeFakeSurveyResult = (): SurveyResultModel => ({
  id: 'any_id',
  surveyId: 'any_survey_id',
  accountId: 'any_account_id',
  ...makeFakeSurveyResultData()
})

const makeFakeRequest = (): HttpRequest => ({
  params: {
    surveyId: 'any_survey_id'
  },
  body: makeFakeSurveyResultData(),
  accountId: 'any_account_id'

})

const makeLoadSurveyById = (): LoadSurveyById => {
  class LoadSurveyByIdStub implements LoadSurveyById {
    async loadById (id: string): Promise<SurveyModel> {
      return await new Promise(resolve => resolve(makeFakeSurvey()))
    }
  }

  return new LoadSurveyByIdStub()
}

const makeSaveSurveyResult = (): SaveSurveyResult => {
  class SaveSurveyResultStub implements SaveSurveyResult {
    async save (account: SaveSurveyResultParams): Promise<SurveyResultModel> {
      return await new Promise(resolve => resolve(makeFakeSurveyResult()))
    }
  }

  return new SaveSurveyResultStub()
}

const makeSaveSurveysResultController = (): SaveSurveyResultControllerTypes => {
  const saveSurveyResultStub = makeSaveSurveyResult()
  const loadSurveyByIdStub = makeLoadSurveyById()

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
    await saveSurveyResultController.handle(makeFakeRequest())

    expect(loadSurveyByIdSpy).toHaveBeenCalledWith('any_survey_id')
  })

  test('Should return 403 if LoadSurveyById returns null', async () => {
    const {
      saveSurveyResultController,
      loadSurveyByIdStub
    } = makeSaveSurveysResultController()

    jest
      .spyOn(loadSurveyByIdStub, 'loadById')
      .mockReturnValueOnce(new Promise(resolve => resolve(null as any)))

    const httpResponse = await saveSurveyResultController.handle(makeFakeRequest())

    expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
  })

  test('Should return 403 if an invalid answer is provided', async () => {
    const {
      saveSurveyResultController
    } = makeSaveSurveysResultController()

    const httpResponse = await saveSurveyResultController.handle({
      body: {
        answer: 'wrong_answer'
      },
      params: {
        surveyId: 'any_survey_id'
      }
    })

    expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
  })

  test('Should return 500 if LoadSurveyById throws', async () => {
    const {
      saveSurveyResultController,
      loadSurveyByIdStub
    } = makeSaveSurveysResultController()

    jest.spyOn(loadSurveyByIdStub, 'loadById').mockReturnValueOnce(new Promise((resolve, reject) =>
      reject(new Error())
    ))

    const httpResponse = await saveSurveyResultController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should call SaveSurveyResult', async () => {
    const {
      saveSurveyResultController,
      saveSurveyResultStub
    } = makeSaveSurveysResultController()

    const saveSpy = jest.spyOn(saveSurveyResultStub, 'save')
    await saveSurveyResultController.handle(makeFakeRequest())

    expect(saveSpy).toHaveBeenCalledWith({
      surveyId: 'any_survey_id',
      accountId: 'any_account_id',
      ...makeFakeSurveyResultData()
    })
  })

  test('Should return 500 if SaveSurveyResult throws', async () => {
    const {
      saveSurveyResultController,
      saveSurveyResultStub
    } = makeSaveSurveysResultController()

    jest.spyOn(saveSurveyResultStub, 'save').mockReturnValueOnce(new Promise((resolve, reject) =>
      reject(new Error())
    ))

    const httpResponse = await saveSurveyResultController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 on success', async () => {
    const {
      saveSurveyResultController
    } = makeSaveSurveysResultController()

    const httpResponse = await saveSurveyResultController.handle(makeFakeRequest())
    expect(httpResponse).toEqual(ok(makeFakeSurveyResult()))
  })
})
