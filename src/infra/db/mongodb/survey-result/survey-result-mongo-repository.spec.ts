import { Collection, ObjectId } from 'mongodb'

import { AccountModel } from '@/domain/models/account'
import { SurveyModel } from '@/domain/models/survey'
import { SurveyResultModel } from '@/domain/models/survey-result'
import { mockAccountParams } from '@/domain/test'

import { MongoHelper } from '../helpers'
import { SurveyResultMongoRepository } from './survey-result-mongo-repository'

let surveyCollection: Collection
let accountCollection: Collection
let surveyResultCollection: Collection

const mockAccount = async (): Promise<AccountModel> => {
  const res = await accountCollection.insertOne(mockAccountParams())

  return MongoHelper.map(res.ops[0])
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

  return MongoHelper.map(res.ops[0])
}

const mockSurveyResult = async (account: AccountModel, survey: SurveyModel): Promise<void> => {
  await surveyResultCollection.insertOne({
    accountId: new ObjectId(account.id),
    surveyId: new ObjectId(survey.id),
    answer: survey.answers[0].answer,
    date: new Date()
  })
}

const mockSurveyResultMany = async (account: AccountModel, survey: SurveyModel): Promise<void> => {
  await surveyResultCollection.insertMany(
    [
      {
        accountId: new ObjectId(account.id),
        surveyId: new ObjectId(survey.id),
        answer: survey.answers[0].answer,
        date: new Date()
      },
      {
        accountId: new ObjectId(account.id),
        surveyId: new ObjectId(survey.id),
        answer: survey.answers[0].answer,
        date: new Date()
      },
      {
        accountId: new ObjectId(account.id),
        surveyId: new ObjectId(survey.id),
        answer: survey.answers[1].answer,
        date: new Date()
      },
      {
        accountId: new ObjectId(account.id),
        surveyId: new ObjectId(survey.id),
        answer: survey.answers[1].answer,
        date: new Date()
      }
    ]
  )
}

const findOneSurveyResult = async (account: AccountModel, survey: SurveyModel): Promise<SurveyResultModel> => {
  const surveyResult = await surveyResultCollection.findOne({
    accountId: new ObjectId(account.id),
    surveyId: new ObjectId(survey.id)
  })

  return surveyResult
}

const findSurveyResult = async (account: AccountModel, survey: SurveyModel): Promise<SurveyResultModel[]> => {
  const surveyResult = await surveyResultCollection.find({
    accountId: new ObjectId(account.id),
    surveyId: new ObjectId(survey.id)
  }).toArray()

  return surveyResult
}

const makeSurveyResultMongoRepository = (): SurveyResultMongoRepository => {
  return new SurveyResultMongoRepository()
}
describe('Survey Result Mongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL as string)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyResultCollection = await MongoHelper.getCollection('surveyResults')
    await surveyResultCollection.deleteMany({})

    surveyCollection = await MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})

    accountCollection = await MongoHelper.getCollection('accounts')
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
      const survey = await mockSurvey()

      await mockSurveyResultMany(account, survey)

      const surveyMongoRepository = makeSurveyResultMongoRepository()

      const surveyResult = await surveyMongoRepository.loadBySurveyId(survey.id)

      expect(surveyResult).toBeTruthy()

      expect(surveyResult.surveyId).toEqual(survey.id)
      expect(surveyResult.answers[0].count).toBe(2)
      expect(surveyResult.answers[0].percent).toBe(50)
      expect(surveyResult.answers[1].count).toBe(2)
      expect(surveyResult.answers[1].percent).toBe(50)
      expect(surveyResult.answers[2].count).toBe(0)
      expect(surveyResult.answers[2].percent).toBe(0)
    })

    test('Should return null if there is no survey result', async () => {
      const survey = await mockSurvey()
      const surveyMongoRepository = makeSurveyResultMongoRepository()

      const surveyResult = await surveyMongoRepository.loadBySurveyId(survey.id)

      expect(surveyResult).toBeNull()
    })
  })
})
