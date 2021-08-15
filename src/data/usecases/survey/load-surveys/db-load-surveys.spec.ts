import { mockLoadSurveysRepository } from '@/data/test'
import { throwError, mockSurveyModels } from '@/domain/test'
import { LoadSurveysRepository } from './db-load-surveys-protocols'
import { DbLoadSurveys } from './db-load-surveys'
import MockDate from 'mockdate'

type DbAddSurveyTypes = {
  dbLoadSurveys: DbLoadSurveys
  loadSurveysRepositoryStub: LoadSurveysRepository
}

const makeDbAddSurvey = (): DbAddSurveyTypes => {
  const loadSurveysRepositoryStub = mockLoadSurveysRepository()
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
    expect(surveys).toEqual(mockSurveyModels())
  })

  test('Should throw if LoadSurveysRepository throw', async () => {
    const {
      dbLoadSurveys,
      loadSurveysRepositoryStub
    } = makeDbAddSurvey()

    jest.spyOn(loadSurveysRepositoryStub, 'loadAll')
      .mockImplementationOnce(throwError)

    const promise = dbLoadSurveys.load()

    await expect(promise).rejects.toThrow()
  })
})
