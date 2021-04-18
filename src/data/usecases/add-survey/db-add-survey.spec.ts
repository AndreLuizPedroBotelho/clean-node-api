import { AddSurveyModel, AddSurveyRepository } from './db-add-survey-protocols'
import { DbAddSurvey } from './db-add-survey'

interface DbAddSurveyTypes{
  dbAddSurvey: DbAddSurvey
  addSurveyRepositoryStub: AddSurveyRepository
}

const makeFakeSurvey = (): AddSurveyModel => ({
  question: 'any_question',
  answers: [{
    image: 'any_image',
    answer: 'any_answer'
  }]
})

const makeAddSurveyRepository = (): AddSurveyRepository => {
  class AddSurveyRepositoryStub implements AddSurveyRepository {
    async add (account: AddSurveyModel): Promise<void> {
      return await new Promise(resolve => resolve())
    }
  }

  return new AddSurveyRepositoryStub()
}

const makeDbAddSurvey = (): DbAddSurveyTypes => {
  const addSurveyRepositoryStub = makeAddSurveyRepository()
  const dbAddSurvey = new DbAddSurvey(addSurveyRepositoryStub)

  return {
    dbAddSurvey,
    addSurveyRepositoryStub
  }
}
describe('DbAddSurvey UseCase', () => {
  test('Should call AddSurveyRepository with correct values', async () => {
    const { dbAddSurvey, addSurveyRepositoryStub } = makeDbAddSurvey()
    const survey = makeFakeSurvey()
    const addSurveyRepositorySpy = jest.spyOn(addSurveyRepositoryStub, 'add')

    await dbAddSurvey.add(survey)

    expect(addSurveyRepositorySpy).toHaveBeenCalledWith(survey)
  })
})
