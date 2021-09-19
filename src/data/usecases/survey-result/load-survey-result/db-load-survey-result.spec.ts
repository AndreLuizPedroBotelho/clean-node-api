import { LoadSurveyByIdRepository } from './../../../protocols/db/survey/load-survey-by-id-repository'
import { mockLoadSurveyByIdRepository, mockLoadSurveyResultRepository } from '@/data/test'
import { DbLoadSurveyResult } from './db-load-survey-result'
import { throwError, mockSurveyResultModel, mockSurveyResultEmptyAnswer } from '@/domain/test'
import MockDate from 'mockdate'

import {
  LoadSurveyResultRepository
} from './db-load-survey-result-protocols'

type DbLoadSurveyResultTypes = {
  dbLoadSurveyResult: DbLoadSurveyResult
  loadSurveyResultRepositoryStub: LoadSurveyResultRepository
  loadSurveyByIdRepositoryStub: LoadSurveyByIdRepository
}

const makeDbLoadSurveyResult = (): DbLoadSurveyResultTypes => {
  const loadSurveyResultRepositoryStub = mockLoadSurveyResultRepository()
  const loadSurveyByIdRepositoryStub = mockLoadSurveyByIdRepository()

  const dbLoadSurveyResult = new DbLoadSurveyResult(loadSurveyResultRepositoryStub, loadSurveyByIdRepositoryStub)

  return {
    loadSurveyResultRepositoryStub,
    dbLoadSurveyResult,
    loadSurveyByIdRepositoryStub
  }
}

describe('DbLoadSurveyResult UseCase', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

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

  test('Should call LoadSurveyByIdRepository if LoadSurveyResultRepository returns null', async () => {
    const {
      dbLoadSurveyResult,
      loadSurveyResultRepositoryStub,
      loadSurveyByIdRepositoryStub
    } = makeDbLoadSurveyResult()

    const loadByIdSpy = jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById')

    jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId')
      .mockReturnValueOnce(Promise.resolve(null as any))

    await dbLoadSurveyResult.load('any_survey_id')

    expect(loadByIdSpy).toHaveBeenCalledWith('any_survey_id')
  })

  test('Should return surveyResultModel with all answers with 0 if LoadSurveyResultRepository returns null', async () => {
    const {
      dbLoadSurveyResult,
      loadSurveyResultRepositoryStub
    } = makeDbLoadSurveyResult()

    jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId')
      .mockReturnValueOnce(Promise.resolve(null as any))

    const saveResult = await dbLoadSurveyResult.load('any_survey_id')

    expect(saveResult).toEqual(mockSurveyResultEmptyAnswer())
  })

  test('Should load LoadSurveyResultRepository succeeds', async () => {
    const {
      dbLoadSurveyResult
    } = makeDbLoadSurveyResult()

    const saveResult = await dbLoadSurveyResult.load('any_survey_id')

    expect(saveResult).toEqual(mockSurveyResultModel())
  })
})
