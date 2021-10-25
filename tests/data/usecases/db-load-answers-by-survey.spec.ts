import { mockLoadSurveyByIdRepository } from '@/tests/data/mocks'
import { LoadSurveyByIdRepository } from '@/data/protocols'
import { DbLoadAnswersBySurvey } from '@/data/usecases'
import { throwError, mockSurveyModel } from '@/tests/domain/mocks'

type DbLoadAnswersBySurveyTypes = {
  dbLoadAnswersBySurvey: DbLoadAnswersBySurvey
  loadSurveyByIdRepositoryStub: LoadSurveyByIdRepository
}

const makeDbLoadAnswersBySurvey = (): DbLoadAnswersBySurveyTypes => {
  const loadSurveyByIdRepositoryStub = mockLoadSurveyByIdRepository()
  const dbLoadAnswersBySurvey = new DbLoadAnswersBySurvey(loadSurveyByIdRepositoryStub)

  return {
    dbLoadAnswersBySurvey,
    loadSurveyByIdRepositoryStub
  }
}

describe('DbLoadAnswersBySurvey UseCase', () => {
  test('Should call LoadSurveyByIdRepository ', async () => {
    const {
      dbLoadAnswersBySurvey,
      loadSurveyByIdRepositoryStub
    } = makeDbLoadAnswersBySurvey()

    const loadByIdSpy = jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById')

    await dbLoadAnswersBySurvey.loadAnswers('any_id')

    expect(loadByIdSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return answers on success', async () => {
    const {
      dbLoadAnswersBySurvey
    } = makeDbLoadAnswersBySurvey()

    const answers = await dbLoadAnswersBySurvey.loadAnswers('any_id')
    expect(answers).toEqual([
      mockSurveyModel().answers[0].answer,
      mockSurveyModel().answers[1].answer
    ])
  })

  test('Should return empty array if LoadSurveyByIdRepository returns null', async () => {
    const {
      dbLoadAnswersBySurvey,
      loadSurveyByIdRepositoryStub
    } = makeDbLoadAnswersBySurvey()

    jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById').mockReturnValueOnce(Promise.resolve(null))

    const answers = await dbLoadAnswersBySurvey.loadAnswers('any_id')

    expect(answers).toEqual([])
  })

  test('Should throw if LoadSurveyByIdRepository throw', async () => {
    const {
      dbLoadAnswersBySurvey,
      loadSurveyByIdRepositoryStub
    } = makeDbLoadAnswersBySurvey()

    jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById')
      .mockImplementationOnce(throwError)

    const promise = dbLoadAnswersBySurvey.loadAnswers('any_id')

    await expect(promise).rejects.toThrow()
  })
})
