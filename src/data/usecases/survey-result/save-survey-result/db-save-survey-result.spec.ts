import { throwError, mockSurveyResultParams, mockSurveyResultModel } from '@/domain/test'
import { mockSaveSurveyResultRepository } from '@/data/test'

import {
  SaveSurveyResultRepository
} from './db-save-survey-result-protocols'

import { DbSaveSurveyResult } from './db-save-survey-result'
import MockDate from 'mockdate'

type DbSaveSurveyResultTypes = {
  dbSaveSurveyResult: DbSaveSurveyResult
  saveSurveyResultRepositoryStub: SaveSurveyResultRepository
}

const makeDbSaveSurveyResult = (): DbSaveSurveyResultTypes => {
  const saveSurveyResultRepositoryStub = mockSaveSurveyResultRepository()
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
    } = makeDbSaveSurveyResult()

    const surveyResult = mockSurveyResultParams()
    const saveSurveyResultRepositorySpy = jest.spyOn(saveSurveyResultRepositoryStub, 'save')

    await dbSaveSurveyResult.save(surveyResult)

    expect(saveSurveyResultRepositorySpy).toHaveBeenCalledWith(surveyResult)
  })

  test('Should throw if SaveSurveyResultRepository throw', async () => {
    const {
      dbSaveSurveyResult,
      saveSurveyResultRepositoryStub
    } = makeDbSaveSurveyResult()

    const surveyResult = mockSurveyResultParams()

    jest.spyOn(saveSurveyResultRepositoryStub, 'save')
      .mockImplementationOnce(throwError)

    const promise = dbSaveSurveyResult.save(surveyResult)

    await expect(promise).rejects.toThrow()
  })

  test('Should save SurveyResult succeeds', async () => {
    const {
      dbSaveSurveyResult
    } = makeDbSaveSurveyResult()

    const surveyResult = mockSurveyResultParams()

    const saveResult = await dbSaveSurveyResult.save(surveyResult)

    expect(saveResult).toEqual(mockSurveyResultModel())
  })
})
