import { DbLoadSurveyById } from './db-load-survey-by-id'

import { SurveyModel, LoadSurveyByIdRepository } from './db-load-survey-by-id-protocols'
import MockDate from 'mockdate'

type DbLoadSurveyByIdTypes = {
  dbLoadSurveyById: DbLoadSurveyById
  loadSurveyByIdRepositoryStub: LoadSurveyByIdRepository
}

const makeFakeSurveys = (): SurveyModel => (
  {
    id: 'any_id',
    question: 'any_question',
    answers: [{
      image: 'any_image',
      answer: 'any_answer'
    }],
    date: new Date()
  })

const makeLoadSurveyByIdRepository = (): LoadSurveyByIdRepository => {
  class LoadSurveyByIdRepositoryStub implements LoadSurveyByIdRepository {
    async loadById (id: string): Promise<SurveyModel> {
      return await new Promise(resolve => resolve(makeFakeSurveys()))
    }
  }

  return new LoadSurveyByIdRepositoryStub()
}

const makeDbLoadSurveyById = (): DbLoadSurveyByIdTypes => {
  const loadSurveyByIdRepositoryStub = makeLoadSurveyByIdRepository()
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
})
