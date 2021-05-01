import {
  SurveyResultModel,
  SaveSurveyResultModel,
  SaveSurveyResultRepository
} from './db-save-survey-result-protocols'

import { DbSaveSurveyResult } from './db-save-survey-result'
import MockDate from 'mockdate'

type DbSaveSurveyResultTypes = {
  dbSaveSurveyResult: DbSaveSurveyResult
  saveSurveyResultRepositoryStub: SaveSurveyResultRepository
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

const makeSaveSurveyResultRepository = (): SaveSurveyResultRepository => {
  class SaveSurveyResultRepositoryStub implements SaveSurveyResultRepository {
    async save (data: SaveSurveyResultModel): Promise<SurveyResultModel> {
      return await new Promise(resolve => resolve(makeFakeSurveyResult()))
    }
  }

  return new SaveSurveyResultRepositoryStub()
}

const makeDbAddSurvey = (): DbSaveSurveyResultTypes => {
  const saveSurveyResultRepositoryStub = makeSaveSurveyResultRepository()
  const dbSaveSurveyResult = new DbSaveSurveyResult(saveSurveyResultRepositoryStub)

  return {
    dbSaveSurveyResult,
    saveSurveyResultRepositoryStub
  }
}
describe('DbSaveSurveyResult UseCase', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call SaveSurveyResultRepository with correct values', async () => {
    const {
      dbSaveSurveyResult,
      saveSurveyResultRepositoryStub
    } = makeDbAddSurvey()

    const surveyResult = makeFakeSurveyResultData()
    const saveSurveyResultRepositorySpy = jest.spyOn(saveSurveyResultRepositoryStub, 'save')

    await dbSaveSurveyResult.save(surveyResult)

    expect(saveSurveyResultRepositorySpy).toHaveBeenCalledWith(surveyResult)
  })

  test('Should throw if SaveSurveyResultRepository throw', async () => {
    const {
      dbSaveSurveyResult,
      saveSurveyResultRepositoryStub
    } = makeDbAddSurvey()

    const surveyResult = makeFakeSurveyResultData()

    jest.spyOn(saveSurveyResultRepositoryStub, 'save')
      .mockReturnValue(
        new Promise((resolve, reject) => reject(new Error()))
      )

    const promise = dbSaveSurveyResult.save(surveyResult)

    await expect(promise).rejects.toThrow()
  })
})
