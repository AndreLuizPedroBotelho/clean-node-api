import { throwError, mockSurveyResultParams, mockSurveyResultModel } from '@/domain/test'
import { mockSaveSurveyResultRepository, mockLoadSurveyResultRepository } from '@/data/test'

import {
  SaveSurveyResultRepository,
  LoadSurveyResultRepository
} from './db-save-survey-result-protocols'

import { DbSaveSurveyResult } from './db-save-survey-result'
import MockDate from 'mockdate'

type DbSaveSurveyResultTypes = {
  dbSaveSurveyResult: DbSaveSurveyResult
  saveSurveyResultRepositoryStub: SaveSurveyResultRepository
  loadSurveyResultRepositoryStub: LoadSurveyResultRepository
}

const makeDbSaveSurveyResult = (): DbSaveSurveyResultTypes => {
  const saveSurveyResultRepositoryStub = mockSaveSurveyResultRepository()
  const loadSurveyResultRepositoryStub = mockLoadSurveyResultRepository()

  const dbSaveSurveyResult = new DbSaveSurveyResult(saveSurveyResultRepositoryStub, loadSurveyResultRepositoryStub)

  return {
    dbSaveSurveyResult,
    saveSurveyResultRepositoryStub,
    loadSurveyResultRepositoryStub
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

  test('Should call LoadSurveyResultRepository with correct values', async () => {
    const {
      dbSaveSurveyResult,
      loadSurveyResultRepositoryStub
    } = makeDbSaveSurveyResult()

    const surveyResult = mockSurveyResultParams()
    const loadSurveyResultRepositorySpy = jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId')

    await dbSaveSurveyResult.save(surveyResult)

    expect(loadSurveyResultRepositorySpy).toHaveBeenCalledWith(surveyResult.surveyId)
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

  test('Should throw if LoadSurveyResultRepository throw', async () => {
    const {
      dbSaveSurveyResult,
      loadSurveyResultRepositoryStub
    } = makeDbSaveSurveyResult()

    const surveyResult = mockSurveyResultParams()

    jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId')
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
