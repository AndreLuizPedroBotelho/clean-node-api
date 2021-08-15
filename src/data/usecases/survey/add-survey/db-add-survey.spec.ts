import { mockAddSurveyRepository } from '@/data/test'
import { throwError, mockSurveyParams } from '@/domain/test'
import { AddSurveyRepository } from './db-add-survey-protocols'
import { DbAddSurvey } from './db-add-survey'
import MockDate from 'mockdate'

type DbAddSurveyTypes = {
  dbAddSurvey: DbAddSurvey
  addSurveyRepositoryStub: AddSurveyRepository
}

const makeDbAddSurvey = (): DbAddSurveyTypes => {
  const addSurveyRepositoryStub = mockAddSurveyRepository()
  const dbAddSurvey = new DbAddSurvey(addSurveyRepositoryStub)

  return {
    dbAddSurvey,
    addSurveyRepositoryStub
  }
}
describe('DbAddSurvey UseCase', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call AddSurveyRepository with correct values', async () => {
    const { dbAddSurvey, addSurveyRepositoryStub } = makeDbAddSurvey()
    const survey = mockSurveyParams()
    const addSurveyRepositorySpy = jest.spyOn(addSurveyRepositoryStub, 'add')

    await dbAddSurvey.add(survey)

    expect(addSurveyRepositorySpy).toHaveBeenCalledWith(survey)
  })

  test('Should throw if AddSurveyRepository throw', async () => {
    const { dbAddSurvey, addSurveyRepositoryStub } = makeDbAddSurvey()
    jest.spyOn(addSurveyRepositoryStub, 'add').mockImplementationOnce(throwError)

    const promise = dbAddSurvey.add(mockSurveyParams())

    await expect(promise).rejects.toThrow()
  })
})
