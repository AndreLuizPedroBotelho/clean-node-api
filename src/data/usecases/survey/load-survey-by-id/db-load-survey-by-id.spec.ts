import { throwError, mockSurveyModel } from '@/domain/test'
import { DbLoadSurveyById } from './db-load-survey-by-id'

import { LoadSurveyByIdRepository } from './db-load-survey-by-id-protocols'
import MockDate from 'mockdate'
import { mockLoadSurveyByIdRepository } from '../../../test'

type DbLoadSurveyByIdTypes = {
  dbLoadSurveyById: DbLoadSurveyById
  loadSurveyByIdRepositoryStub: LoadSurveyByIdRepository
}

const makeDbLoadSurveyById = (): DbLoadSurveyByIdTypes => {
  const loadSurveyByIdRepositoryStub = mockLoadSurveyByIdRepository()
  const dbLoadSurveyById = new DbLoadSurveyById(loadSurveyByIdRepositoryStub)

  return {
    dbLoadSurveyById,
    loadSurveyByIdRepositoryStub
  }
}

describe('DbLoadSurveyById UseCase', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })
  test('Should call LoadSurveyByIdRepository ', async () => {
    const {
      dbLoadSurveyById,
      loadSurveyByIdRepositoryStub
    } = makeDbLoadSurveyById()

    const loadByIdSpy = jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById')

    await dbLoadSurveyById.loadById('any_id')

    expect(loadByIdSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return Survey on success', async () => {
    const {
      dbLoadSurveyById
    } = makeDbLoadSurveyById()

    const survey = await dbLoadSurveyById.loadById('any_id')
    expect(survey).toEqual(mockSurveyModel())
  })

  test('Should throw if LoadSurveyByIdRepository throw', async () => {
    const {
      dbLoadSurveyById,
      loadSurveyByIdRepositoryStub
    } = makeDbLoadSurveyById()

    jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById')
      .mockImplementationOnce(throwError)

    const promise = dbLoadSurveyById.loadById('any_id')

    await expect(promise).rejects.toThrow()
  })
})
