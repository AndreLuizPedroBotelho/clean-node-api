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

let surveyId: string
let accountId: string
describe('DbLoadSurveyResult UseCase', () => {
  beforeAll(() => {
    MockDate.set(new Date())
    surveyId = 'any_survey_id'
    accountId = 'any_account_id'
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

    await dbLoadSurveyResult.load(surveyId, accountId)

    expect(loadBySurveyIdSpy).toHaveBeenCalledWith(surveyId, accountId)
  })

  test('Should throw if LoadSurveyResultRepository throw', async () => {
    const {
      dbLoadSurveyResult,
      loadSurveyResultRepositoryStub
    } = makeDbLoadSurveyResult()

    jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId')
      .mockImplementationOnce(throwError)

    const promise = dbLoadSurveyResult.load(surveyId, accountId)

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

    await dbLoadSurveyResult.load(surveyId, accountId)

    expect(loadByIdSpy).toHaveBeenCalledWith(surveyId)
  })

  test('Should return surveyResultModel with all answers with 0 if LoadSurveyResultRepository returns null', async () => {
    const {
      dbLoadSurveyResult,
      loadSurveyResultRepositoryStub
    } = makeDbLoadSurveyResult()

    jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId')
      .mockReturnValueOnce(Promise.resolve(null as any))

    const saveResult = await dbLoadSurveyResult.load(surveyId, accountId)

    expect(saveResult).toEqual(mockSurveyResultEmptyAnswer())
  })

  test('Should load LoadSurveyResultRepository succeeds', async () => {
    const {
      dbLoadSurveyResult
    } = makeDbLoadSurveyResult()

    const saveResult = await dbLoadSurveyResult.load(surveyId, accountId)

    expect(saveResult).toEqual(mockSurveyResultModel())
  })
})
