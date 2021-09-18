import { Collection, ObjectId } from 'mongodb'

import { AccountModel } from '@/domain/models/account'
import { SurveyModel } from '@/domain/models/survey'
import { SurveyResultModel } from '@/domain/models/survey-result'

import { MongoHelper } from '../helpers'
import { SurveyResultMongoRepository } from './survey-result-mongo-repository'

let surveyCollection: Collection
let accountCollection: Collection
let surveyResultCollection: Collection

const makeAccount = async (): Promise<AccountModel> => {
  const res = await accountCollection.insertOne({
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password'
  })

  return MongoHelper.map(res.ops[0])
}

const makeSurvey = async (): Promise<SurveyModel> => {
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

const makeSurveyResult = async (account: AccountModel, survey: SurveyModel): Promise<void> => {
  await surveyResultCollection.insertOne({
    accountId: new ObjectId(account.id),
    surveyId: new ObjectId(survey.id),
    answer: survey.answers[0].answer,
    date: new Date()
  })
}

const makeSurveyResultMany = async (account: AccountModel, survey: SurveyModel): Promise<void> => {
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
      const account = await makeAccount()
      const survey = await makeSurvey()

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
      const account = await makeAccount()
      const survey = await makeSurvey()

      await makeSurveyResult(account, survey)

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
      const account = await makeAccount()
      const survey = await makeSurvey()

      await makeSurveyResultMany(account, survey)

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
  })
})
