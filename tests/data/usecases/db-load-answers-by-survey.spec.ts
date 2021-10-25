import { mockLoadAnswersBySurveyRepository } from '@/tests/data/mocks'
import { LoadAnswersBySurveyRepository } from '@/data/protocols'
import { DbLoadAnswersBySurvey } from '@/data/usecases'
import { throwError, mockSurveyModel } from '@/tests/domain/mocks'

type DbLoadAnswersBySurveyTypes = {
  dbLoadAnswersBySurvey: DbLoadAnswersBySurvey
  loadAnswersBySurveyRepositoryStub: LoadAnswersBySurveyRepository
}

const makeDbLoadAnswersBySurvey = (): DbLoadAnswersBySurveyTypes => {
  const loadAnswersBySurveyRepositoryStub = mockLoadAnswersBySurveyRepository()
  const dbLoadAnswersBySurvey = new DbLoadAnswersBySurvey(loadAnswersBySurveyRepositoryStub)

  return {
    dbLoadAnswersBySurvey,
    loadAnswersBySurveyRepositoryStub
  }
}

describe('DbLoadAnswersBySurvey UseCase', () => {
  test('Should call LoadAnswersBySurveyRepository ', async () => {
    const {
      dbLoadAnswersBySurvey,
      loadAnswersBySurveyRepositoryStub
    } = makeDbLoadAnswersBySurvey()

    const loadByIdSpy = jest.spyOn(loadAnswersBySurveyRepositoryStub, 'loadAnswers')

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

  test('Should return empty array if LoadAnswersBySurveyRepository returns empty array', async () => {
    const {
      dbLoadAnswersBySurvey,
      loadAnswersBySurveyRepositoryStub
    } = makeDbLoadAnswersBySurvey()

    jest.spyOn(loadAnswersBySurveyRepositoryStub, 'loadAnswers').mockReturnValueOnce(Promise.resolve([]))

    const answers = await dbLoadAnswersBySurvey.loadAnswers('any_id')

    expect(answers).toEqual([])
  })

  test('Should throw if LoadAnswersBySurveyRepository throw', async () => {
    const {
      dbLoadAnswersBySurvey,
      loadAnswersBySurveyRepositoryStub
    } = makeDbLoadAnswersBySurvey()

    jest.spyOn(loadAnswersBySurveyRepositoryStub, 'loadAnswers')
      .mockImplementationOnce(throwError)

    const promise = dbLoadAnswersBySurvey.loadAnswers('any_id')

    await expect(promise).rejects.toThrow()
  })
})
