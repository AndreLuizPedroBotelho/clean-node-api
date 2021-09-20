import { DbLoadSurveys } from '@/data/usecases'
import { LoadSurveysRepository } from '@/data/protocols'
import { mockLoadSurveysRepository } from '@/tests/data/mocks'
import { throwError, mockSurveyModels } from '@/tests/domain/mocks'
import MockDate from 'mockdate'

type DbAddSurveyTypes = {
  dbLoadSurveys: DbLoadSurveys
  loadSurveysRepositoryStub: LoadSurveysRepository
}

const accountId = 'any_account_id'

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

    await dbLoadSurveys.load(accountId)

    expect(loadSpy).toHaveBeenCalledWith(accountId)
  })

  test('Should return a list of surveys on success', async () => {
    const {
      dbLoadSurveys
    } = makeDbAddSurvey()

    const surveys = await dbLoadSurveys.load(accountId)
    expect(surveys).toEqual(mockSurveyModels())
  })

  test('Should throw if LoadSurveysRepository throw', async () => {
    const {
      dbLoadSurveys,
      loadSurveysRepositoryStub
    } = makeDbAddSurvey()

    jest.spyOn(loadSurveysRepositoryStub, 'loadAll')
      .mockImplementationOnce(throwError)

    const promise = dbLoadSurveys.load(accountId)

    await expect(promise).rejects.toThrow()
  })
})
