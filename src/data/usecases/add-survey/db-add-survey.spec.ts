import { AddSurveyModel, AddSurveyRepository } from './db-add-survey-protocols'
import { DbAddSurvey } from './db-add-survey'

interface DbAddSurveyTypes{
  dbAddSurvey: DbAddSurvey
  addSurveyRepositoryStub: AddSurveyRepository
}

const makeFakeSurveyData = (): AddSurveyModel => ({
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
    const survey = makeFakeSurveyData()
    const addSurveyRepositorySpy = jest.spyOn(addSurveyRepositoryStub, 'add')

    await dbAddSurvey.add(survey)

    expect(addSurveyRepositorySpy).toHaveBeenCalledWith(survey)
  })

  test('Should throw if AddSurveyRepository throw', async () => {
    const { dbAddSurvey, addSurveyRepositoryStub } = makeDbAddSurvey()
    jest.spyOn(addSurveyRepositoryStub, 'add').mockReturnValue(
      new Promise((resolve, reject) => reject(new Error()))
    )

    const promise = dbAddSurvey.add(makeFakeSurveyData())

    await expect(promise).rejects.toThrow()
  })
})
