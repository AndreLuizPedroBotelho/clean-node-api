import { Collection, ObjectId } from 'mongodb'
import { MongoHelper } from '../helpers'
import { SurveyMongoRepository } from './survey-mongo-repository'
import { SurveyModel } from '@/domain/models/survey'
import { AccountModel } from '@/domain/models/account'
import { mockSurveyParams, mockAccountParams } from '@/domain/test'

let surveyCollection: Collection
let surveyResultCollection: Collection
let accountCollection: Collection

const makeSurveyMongoRepository = (): SurveyMongoRepository => {
  return new SurveyMongoRepository()
}

const mockAccount = async (): Promise<AccountModel> => {
  const res = await accountCollection.insertOne(mockAccountParams())

  return MongoHelper.map(res.ops[0])
}

const mockSurvey = async (): Promise<SurveyModel> => {
  const res = await surveyCollection.insertOne({
    question: 'any_question',
    answers: [{
      image: 'any_image',
      answer: 'any_answer'
    },
    {
      answer: 'any_answer'
    }],
    date: new Date()
  })

  return MongoHelper.map(res.ops[0])
}

const mockSurveyMany = async (): Promise<SurveyModel[]> => {
  const res = await surveyCollection.insertMany([mockSurveyParams(), {
    question: 'other_question',
    answers: [{
      image: 'other_image',
      answer: 'other_answer'
    },
    {
      answer: 'other_answer'
    }],
    date: new Date()
  }])

  return res.ops.map(ops => MongoHelper.map(ops))
}

const mockSurveyResult = async (account: AccountModel, survey: SurveyModel): Promise<void> => {
  await surveyResultCollection.insertOne({
    accountId: new ObjectId(account.id),
    surveyId: new ObjectId(survey.id),
    answer: survey.answers[0].answer,
    date: new Date()
  })
}

describe('Survey Mongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL as string)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyCollection = await MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})

    surveyResultCollection = await MongoHelper.getCollection('surveyResults')
    await surveyResultCollection.deleteMany({})

    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('add()', () => {
    test('Should return an survey on add success', async () => {
      const surveyMongoRepository = makeSurveyMongoRepository()
      await surveyMongoRepository.add({
        question: 'any_question',
        answers: [{
          image: 'any_image',
          answer: 'any_answer'
        },
        {
          answer: 'any_answer'
        }],
        date: new Date()
      })

      const survey = await surveyCollection.findOne({ question: 'any_question' })
      expect(survey).toBeTruthy()
    })
  })

  describe('loadAll()', () => {
    test('Should return an list survey', async () => {
      const account = await mockAccount()

      const surveyModels = await mockSurveyMany()

      await mockSurveyResult(account, surveyModels[0])
      const surveyMongoRepository = makeSurveyMongoRepository()
      const surveys = await surveyMongoRepository.loadAll(account.id)

      expect(surveys.length).toBe(2)

      expect(surveys[0].id).toBeTruthy()
      expect(surveys[0].question).toBe(surveyModels[0].question)
      expect(surveys[0].didAnswer).toBe(true)
      expect(surveys[1].question).toBe(surveyModels[1].question)
      expect(surveys[1].didAnswer).toBe(false)
    })
    test('Should load empty list', async () => {
      const account = await mockAccount()

      const surveyMongoRepository = makeSurveyMongoRepository()
      const surveys = await surveyMongoRepository.loadAll(account.id)

      expect(surveys.length).toBe(0)
    })
  })

  describe('loadById()', () => {
    test('Should load survey by id on success', async () => {
      const { id } = await mockSurvey()

      const surveyMongoRepository = makeSurveyMongoRepository()
      const survey = await surveyMongoRepository.loadById(id)

      expect(survey).toBeTruthy()
      expect(survey.id).toBeTruthy()
    })
  })
})
