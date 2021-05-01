import { SaveSurveyResultController } from './save-survey-result-controller'
import { SaveSurveyResult, SurveyResultModel, SaveSurveyResultModel } from './save-survey-result-controller-protocols'

import MockDate from 'mockdate'

type SaveSurveyResultControllerControllerTypes = {
  saveSurveyResultController: SaveSurveyResultController
  saveSurveyResultStub: SaveSurveyResult
}

const makeFakeSurveyResultData = (): SaveSurveyResultModel => ({
  surveyId: 'any_survey_id',
  accountId: 'any_account_id',
  answer: 'any_answer',
  date: new Date()
})

const makeFakeSurveyResult = (): SurveyResultModel => ({
  id: 'any_id',
  ...makeFakeSurveyResultData()
})

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
  const saveSurveyResultController = new SaveSurveyResultController(saveSurveyResultStub)

  return {
    saveSurveyResultController,
    saveSurveyResultStub
  }
}

describe('SaveSurveyResult Controller', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call LoadSurveys', async () => {
    const {
      saveSurveyResultController,
      saveSurveyResultStub
    } = makeLoadSurveysController()

    const saveSpy = jest.spyOn(saveSurveyResultStub, 'save')
    await saveSurveyResultController.handle({
      body: makeFakeSurveyResultData()
    })

    expect(saveSpy).toHaveBeenCalled()
  })
})
