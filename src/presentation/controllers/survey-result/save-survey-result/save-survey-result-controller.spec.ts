import { forbidden } from '@/presentation/helpers/http/http-helper'
import { SaveSurveyResultController } from './save-survey-result-controller'
import {
  SaveSurveyResult,
  SurveyResultModel,
  SaveSurveyResultModel,
  HttpRequest,
  SurveyModel,
  LoadSurveyById
} from './save-survey-result-controller-protocols'

import MockDate from 'mockdate'

type SaveSurveyResultControllerControllerTypes = {
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

const makeFakeSurveyResultData = (): Omit<SaveSurveyResultModel, 'surveyId'> => ({
  accountId: 'any_account_id',
  answer: 'any_answer',
  date: new Date()
})

const makeFakeSurveyResult = (): SurveyResultModel => ({
  id: 'any_id',
  surveyId: 'any_survey_id',
  ...makeFakeSurveyResultData()
})

const makeFakeRequest = (): HttpRequest => ({
  params: {
    surveyId: 'any_survey_id'
  },
  body: makeFakeSurveyResultData()
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
    async save (account: SaveSurveyResultModel): Promise<SurveyResultModel> {
      return await new Promise(resolve => resolve(makeFakeSurveyResult()))
    }
  }

  return new SaveSurveyResultStub()
}

const makeLoadSurveysController = (): SaveSurveyResultControllerControllerTypes => {
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
    } = makeLoadSurveysController()

    const loadSurveyByIdSpy = jest.spyOn(loadSurveyByIdStub, 'loadById')
    await saveSurveyResultController.handle(makeFakeRequest())

    expect(loadSurveyByIdSpy).toHaveBeenCalledWith('any_survey_id')
  })

  test('Should return 403 if LoadSurveyById returns null', async () => {
    const {
      saveSurveyResultController,
      loadSurveyByIdStub
    } = makeLoadSurveysController()

    jest
      .spyOn(loadSurveyByIdStub, 'loadById')
      .mockReturnValueOnce(new Promise(resolve => resolve(null as any)))

    const httpResponse = await saveSurveyResultController.handle(makeFakeRequest())

    expect(httpResponse).toEqual(forbidden(new Error()))
  })

  test('Should call SaveSurveyResult', async () => {
    const {
      saveSurveyResultController,
      saveSurveyResultStub
    } = makeLoadSurveysController()

    const saveSpy = jest.spyOn(saveSurveyResultStub, 'save')
    await saveSurveyResultController.handle(makeFakeRequest())

    expect(saveSpy).toHaveBeenCalledWith({
      surveyId: 'any_survey_id',
      ...makeFakeSurveyResultData()
    })
  })
})
