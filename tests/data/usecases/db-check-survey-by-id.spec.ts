import { mockCheckSurveyByIdRepository } from '@/tests/data/mocks'
import { CheckSurveyByIdRepository } from '@/data/protocols'
import { DbCheckSurveyById } from '@/data/usecases'
import { throwError } from '@/tests/domain/mocks'

type DbCheckSurveyByIdTypes = {
  dbCheckSurveyById: DbCheckSurveyById
  checkSurveyByIdRepositoryStub: CheckSurveyByIdRepository
}

const makeDbCheckSurveyById = (): DbCheckSurveyByIdTypes => {
  const checkSurveyByIdRepositoryStub = mockCheckSurveyByIdRepository()
  const dbCheckSurveyById = new DbCheckSurveyById(checkSurveyByIdRepositoryStub)

  return {
    dbCheckSurveyById,
    checkSurveyByIdRepositoryStub
  }
}

describe('DbCheckSurveyById UseCase', () => {
  test('Should call CheckSurveyByIdRepository ', async () => {
    const {
      dbCheckSurveyById,
      checkSurveyByIdRepositoryStub
    } = makeDbCheckSurveyById()

    const checkByIdSpy = jest.spyOn(checkSurveyByIdRepositoryStub, 'checkById')

    await dbCheckSurveyById.checkById('any_id')

    expect(checkByIdSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return true if CheckSurveyByIdRepository returns true', async () => {
    const {
      dbCheckSurveyById
    } = makeDbCheckSurveyById()

    const exists = await dbCheckSurveyById.checkById('any_id')
    expect(exists).toEqual(true)
  })

  test('Should return false if CheckSurveyByIdRepository returns false', async () => {
    const {
      dbCheckSurveyById,
      checkSurveyByIdRepositoryStub
    } = makeDbCheckSurveyById()

    jest.spyOn(checkSurveyByIdRepositoryStub, 'checkById').mockResolvedValue(false)

    const exists = await dbCheckSurveyById.checkById('any_id')
    expect(exists).toEqual(false)
  })

  test('Should throw if CheckSurveyByIdRepository throw', async () => {
    const {
      dbCheckSurveyById,
      checkSurveyByIdRepositoryStub
    } = makeDbCheckSurveyById()

    jest.spyOn(checkSurveyByIdRepositoryStub, 'checkById')
      .mockImplementationOnce(throwError)

    const promise = dbCheckSurveyById.checkById('any_id')

    await expect(promise).rejects.toThrow()
  })
})
