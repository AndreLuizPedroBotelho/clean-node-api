import { mockLoadSurveyResultRepository } from '@/data/test'
import { DbLoadSurveyResult } from './db-load-survey-result'

import {
  LoadSurveyResultRepository
} from './db-load-survey-result-protocols'

type DbLoadSurveyResultTypes = {
  dbLoadSurveyResult: DbLoadSurveyResult
  loadSurveyResultRepositoryStub: LoadSurveyResultRepository
}

const makeDbLoadSurveyResult = (): DbLoadSurveyResultTypes => {
  const loadSurveyResultRepositoryStub = mockLoadSurveyResultRepository()
  const dbLoadSurveyResult = new DbLoadSurveyResult(loadSurveyResultRepositoryStub)

  return {
    loadSurveyResultRepositoryStub,
    dbLoadSurveyResult
  }
}

describe('DbLoadSurveyResult UseCase', () => {
  test('Should call loadSurveyResultRepository with correct values', async () => {
    const {
      dbLoadSurveyResult,
      loadSurveyResultRepositoryStub
    } = makeDbLoadSurveyResult()

    const loadBySurveyIdSpy = jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId')

    await dbLoadSurveyResult.load('any_survey_id')

    expect(loadBySurveyIdSpy).toHaveBeenCalledWith('any_survey_id')
  })
})
