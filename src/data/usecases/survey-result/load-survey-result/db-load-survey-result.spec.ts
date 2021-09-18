import { mockLoadSurveyResultRepository } from '@/data/test'
import { DbLoadSurveyResult } from './db-load-survey-result'
import { throwError, mockSurveyResultModel } from '@/domain/test'

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
  test('Should call LoadSurveyResultRepository with correct values', async () => {
    const {
      dbLoadSurveyResult,
      loadSurveyResultRepositoryStub
    } = makeDbLoadSurveyResult()

    const loadBySurveyIdSpy = jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId')

    await dbLoadSurveyResult.load('any_survey_id')

    expect(loadBySurveyIdSpy).toHaveBeenCalledWith('any_survey_id')
  })

  test('Should throw if LoadSurveyResultRepository throw', async () => {
    const {
      dbLoadSurveyResult,
      loadSurveyResultRepositoryStub
    } = makeDbLoadSurveyResult()

    jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId')
      .mockImplementationOnce(throwError)

    const promise = dbLoadSurveyResult.load('any_survey_id')

    await expect(promise).rejects.toThrow()
  })

  test('Should load LoadSurveyResultRepository succeeds', async () => {
    const {
      dbLoadSurveyResult
    } = makeDbLoadSurveyResult()

    const saveResult = await dbLoadSurveyResult.load('any_survey_id')

    expect(saveResult).toEqual(mockSurveyResultModel())
  })
})
