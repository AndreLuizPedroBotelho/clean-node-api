import { Collection, ObjectId } from 'mongodb'

import { AccountModel, SurveyModel, SurveyResultModel } from '@/domain/models'
import { mockAccountParams } from '@/tests/domain/mocks'

import { MongoHelper, SurveyResultMongoRepository } from '@/infra/db'

let surveyCollection: Collection
let accountCollection: Collection
let surveyResultCollection: Collection

const mockAccount = async (): Promise<AccountModel> => {
  const res = await accountCollection.insertOne(mockAccountParams())
  const account = await accountCollection.findOne({ _id: res.insertedId })

  return MongoHelper.map(account)
}

const mockSurvey = async (): Promise<SurveyModel> => {
  const res = await surveyCollection.insertOne({
    question: 'any_question',
    answers: [
      {
        image: 'any_image',
        answer: 'any_answer_1'
      },
      {
        answer: 'any_answer_2'
      },
      {
        answer: 'any_answer_3'
      }
    ],
    date: new Date()
  })

  const survey = await surveyCollection.findOne({ _id: res.insertedId })

  return MongoHelper.map(survey)
}

const mockSurveyResult = async (account: AccountModel, survey: SurveyModel): Promise<void> => {
  await surveyResultCollection.insertOne({
    accountId: new ObjectId(account.id),
    surveyId: new ObjectId(survey.id),
    answer: survey.answers[0].answer,
    date: new Date()
  })
}

type AccountModelWithChoice = AccountModel & { answerChoice: number }

const mockSurveyResultMany = async (account: AccountModelWithChoice[], survey: SurveyModel): Promise<void> => {
  const surveyResults = account.map(account => ({
    accountId: new ObjectId(account.id),
    surveyId: new ObjectId(survey.id),
    answer: survey.answers[account.answerChoice].answer,
    date: new Date()
  }))

  await surveyResultCollection.insertMany(
    surveyResults
  )
}

const findOneSurveyResult = async (account: AccountModel, survey: SurveyModel): Promise<SurveyResultModel> => {
  const surveyResult = await surveyResultCollection.findOne({
    accountId: new ObjectId(account.id),
    surveyId: new ObjectId(survey.id)
  })

  return surveyResult as SurveyResultModel
}

const findSurveyResult = async (account: AccountModel, survey: SurveyModel): Promise<SurveyResultModel[]> => {
  const surveyResult = await surveyResultCollection.find({
    accountId: new ObjectId(account.id),
    surveyId: new ObjectId(survey.id)
  }).toArray()

  return surveyResult as SurveyResultModel[]
}

const makeSurveyResultMongoRepository = (): SurveyResultMongoRepository => {
  return new SurveyResultMongoRepository()
}
describe('Survey Result Mongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyResultCollection = MongoHelper.getCollection('surveyResults')
    await surveyResultCollection.deleteMany({})

    surveyCollection = MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})

    accountCollection = MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('save()', () => {
    test('Should add a survey if its new', async () => {
      const account = await mockAccount()
      const survey = await mockSurvey()

      const surveyMongoRepository = makeSurveyResultMongoRepository()

      await surveyMongoRepository.save({
        accountId: account.id,
        surveyId: survey.id,
        answer: survey.answers[0].answer,
        date: new Date()
      })

      const surveyResult = await findOneSurveyResult(account, survey)

      expect(surveyResult).toBeTruthy()
      expect(surveyResult.surveyId).toEqual(survey.id)
    })

    test('Should update survey result if its not new', async () => {
      const account = await mockAccount()
      const survey = await mockSurvey()

      await mockSurveyResult(account, survey)

      const surveyMongoRepository = makeSurveyResultMongoRepository()

      await surveyMongoRepository.save({
        accountId: account.id,
        surveyId: survey.id,
        answer: survey.answers[1].answer,
        date: new Date()
      })

      const surveyResult = await findSurveyResult(account, survey)

      expect(surveyResult).toBeTruthy()
      expect(surveyResult.length).toBe(1)
    })
  })

  describe('loadBySurveyId()', () => {
    test('Should load survey result', async () => {
      const account = await mockAccount()
      const account2 = await mockAccount()

      const survey = await mockSurvey()

      await mockSurveyResultMany(
        [
          { ...account, answerChoice: 0 },
          { ...account2, answerChoice: 0 }
        ],
        survey
      )

      const surveyMongoRepository = makeSurveyResultMongoRepository()

      const surveyResult = await surveyMongoRepository.loadBySurveyId(survey.id, account.id)

      expect(surveyResult).toBeTruthy()

      expect(surveyResult.surveyId).toEqual(survey.id)
      expect(surveyResult.answers[0].count).toBe(2)
      expect(surveyResult.answers[0].percent).toBe(100)
      expect(surveyResult.answers[0].isCurrentAccountAnswer).toBe(true)

      expect(surveyResult.answers[1].count).toBe(0)
      expect(surveyResult.answers[1].percent).toBe(0)
      expect(surveyResult.answers[1].isCurrentAccountAnswer).toBe(false)
    })

    test('Should load survey result 2', async () => {
      const account = await mockAccount()
      const account2 = await mockAccount()
      const account3 = await mockAccount()

      const survey = await mockSurvey()

      await mockSurveyResultMany(
        [
          { ...account, answerChoice: 0 },
          { ...account2, answerChoice: 1 },
          { ...account3, answerChoice: 1 }
        ],
        survey
      )
      const surveyMongoRepository = makeSurveyResultMongoRepository()

      const surveyResult = await surveyMongoRepository.loadBySurveyId(survey.id, account2.id)

      expect(surveyResult).toBeTruthy()

      expect(surveyResult.surveyId).toEqual(survey.id)
      expect(surveyResult.answers[0].count).toBe(2)
      expect(surveyResult.answers[0].percent).toBe(67)
      expect(surveyResult.answers[0].isCurrentAccountAnswer).toBe(true)

      expect(surveyResult.answers[1].count).toBe(1)
      expect(surveyResult.answers[1].percent).toBe(33)
      expect(surveyResult.answers[1].isCurrentAccountAnswer).toBe(false)
    })

    test('Should load survey result 3', async () => {
      const account = await mockAccount()
      const account2 = await mockAccount()
      const account3 = await mockAccount()

      const survey = await mockSurvey()

      await mockSurveyResultMany(
        [
          { ...account, answerChoice: 0 },
          { ...account2, answerChoice: 1 }
        ],
        survey
      )
      const surveyMongoRepository = makeSurveyResultMongoRepository()

      const surveyResult = await surveyMongoRepository.loadBySurveyId(survey.id, account3.id)

      expect(surveyResult).toBeTruthy()

      expect(surveyResult.surveyId).toEqual(survey.id)
      expect(surveyResult.answers[0].count).toBe(1)
      expect(surveyResult.answers[0].percent).toBe(50)
      expect(surveyResult.answers[0].isCurrentAccountAnswer).toBe(false)

      expect(surveyResult.answers[1].count).toBe(1)
      expect(surveyResult.answers[1].percent).toBe(50)
      expect(surveyResult.answers[1].isCurrentAccountAnswer).toBe(false)
    })

    test('Should return null if there is no survey result', async () => {
      const survey = await mockSurvey()
      const account = await mockAccount()

      const surveyMongoRepository = makeSurveyResultMongoRepository()

      const surveyResult = await surveyMongoRepository.loadBySurveyId(survey.id, account.id)

      expect(surveyResult).toBeNull()
    })
  })
})
