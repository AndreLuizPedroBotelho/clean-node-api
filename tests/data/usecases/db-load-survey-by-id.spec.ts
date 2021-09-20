import { mockLoadSurveyByIdRepository } from '@/tests/data/mocks'
import { LoadSurveyByIdRepository } from '@/data/protocols'
import { DbLoadSurveyById } from '@/data/usecases'
import { throwError, mockSurveyModel } from '@/tests/domain/mocks'

import MockDate from 'mockdate'

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
