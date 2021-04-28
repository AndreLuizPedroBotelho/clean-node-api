import { SurveyModel, LoadSurveysRepository } from './db-load-surveys-protocols'
import { DbLoadSurveys } from './db-load-surveys'
import MockDate from 'mockdate'

interface DbAddSurveyTypes{
  dbLoadSurveys: DbLoadSurveys
  loadSurveysRepositoryStub: LoadSurveysRepository
}

const makeFakeSurveys = (): SurveyModel[] => ([
  {
    id: 'any_id',
    question: 'any_question',
    answers: [{
      image: 'any_image',
      answer: 'any_answer'
    }],
    date: new Date()
  },
  {
    id: 'other_id',
    question: 'other_question',
    answers: [{
      image: 'other_image',
      answer: 'other_answer'
    }],
    date: new Date()
  }])

const makeLoadSurveysRepository = (): LoadSurveysRepository => {
  class LoadSurveysRepositoryStub implements LoadSurveysRepository {
    async loadAll (): Promise<SurveyModel[]> {
      return await new Promise(resolve => resolve(makeFakeSurveys()))
    }
  }

  return new LoadSurveysRepositoryStub()
}

const makeDbAddSurvey = (): DbAddSurveyTypes => {
  const loadSurveysRepositoryStub = makeLoadSurveysRepository()
  const dbLoadSurveys = new DbLoadSurveys(loadSurveysRepositoryStub)

  return {
    dbLoadSurveys,
    loadSurveysRepositoryStub
  }
}
describe('DbLoadSurveys UseCase', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call LoadSurveysRepository ', async () => {
    const {
      dbLoadSurveys,
      loadSurveysRepositoryStub
    } = makeDbAddSurvey()

    const loadSpy = jest.spyOn(loadSurveysRepositoryStub, 'loadAll')

    await dbLoadSurveys.load()

    expect(loadSpy).toHaveBeenCalled()
  })

  test('Should return a list of surveys on success', async () => {
    const {
      dbLoadSurveys
    } = makeDbAddSurvey()

    const surveys = await dbLoadSurveys.load()
    expect(surveys).toEqual(makeFakeSurveys())
  })

  test('Should throw if LoadSurveysRepository throw', async () => {
    const {
      dbLoadSurveys,
      loadSurveysRepositoryStub
    } = makeDbAddSurvey()

    jest.spyOn(loadSurveysRepositoryStub, 'loadAll')
      .mockReturnValue(
        new Promise((resolve, reject) => reject(new Error()))
      )

    const promise = dbLoadSurveys.load()

    await expect(promise).rejects.toThrow()
  })
})
