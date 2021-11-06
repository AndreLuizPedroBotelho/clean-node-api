import { MongoHelper, SurveyMongoRepository } from '@/infra/db'

import { Collection, ObjectId } from 'mongodb'
import BsonObjectId from 'bson-objectid'

import { SurveyModel, SurveyAnswerModel } from '@/domain/models'
import { mockSurveyParams, mockAccountParams } from '@/tests/domain/mocks'

let surveyCollection: Collection
let surveyResultCollection: Collection
let accountCollection: Collection

const makeSurveyMongoRepository = (): SurveyMongoRepository => {
  return new SurveyMongoRepository()
}

const mockAccountId = async (): Promise<string> => {
  const res = await accountCollection.insertOne(mockAccountParams())

  return res.insertedId.toHexString()
}

const mockAnswers = (): SurveyAnswerModel[] => {
  return [
    {
      image: 'any_image',
      answer: 'any_answer'
    },
    {
      answer: 'any_answer'
    }
  ]
}

const mockSurveyId = async (): Promise<string> => {
  const res = await surveyCollection.insertOne({
    question: 'any_question',
    answers: mockAnswers(),
    date: new Date()
  })

  return res.insertedId.toHexString()
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

  const surveys = await surveyCollection.find({
    _id: {
      $in: [
        res.insertedIds[0],
        res.insertedIds[1]

      ]
    }
  }).toArray()

  return surveys.map(survey => MongoHelper.map(survey))
}

const mockSurveyResult = async (accountId: string, survey: SurveyModel): Promise<void> => {
  await surveyResultCollection.insertOne({
    accountId: new ObjectId(accountId),
    surveyId: new ObjectId(survey.id),
    answer: survey.answers[0].answer,
    date: new Date()
  })
}

describe('Survey Mongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyCollection = MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})

    surveyResultCollection = MongoHelper.getCollection('surveyResults')
    await surveyResultCollection.deleteMany({})

    accountCollection = MongoHelper.getCollection('accounts')
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
      const accountId = await mockAccountId()

      const surveyModels = await mockSurveyMany()

      await mockSurveyResult(accountId, surveyModels[0])
      const surveyMongoRepository = makeSurveyMongoRepository()
      const surveys = await surveyMongoRepository.loadAll(accountId)

      expect(surveys.length).toBe(2)

      expect(surveys[0].id).toBeTruthy()
      expect(surveys[0].question).toBe(surveyModels[0].question)
      expect(surveys[0].didAnswer).toBe(true)
      expect(surveys[1].question).toBe(surveyModels[1].question)
      expect(surveys[1].didAnswer).toBe(false)
    })
    test('Should load empty list', async () => {
      const accountId = await mockAccountId()

      const surveyMongoRepository = makeSurveyMongoRepository()
      const surveys = await surveyMongoRepository.loadAll(accountId)

      expect(surveys.length).toBe(0)
    })
  })

  describe('loadById()', () => {
    test('Should load survey by id on success', async () => {
      const surveyId = await mockSurveyId()

      const surveyMongoRepository = makeSurveyMongoRepository()
      const survey = await surveyMongoRepository.loadById(surveyId)

      expect(survey).toBeTruthy()
      expect(survey.id).toBeTruthy()
    })

    test('Should return null', async () => {
      const surveyMongoRepository = makeSurveyMongoRepository()
      const FakeObjectId = new BsonObjectId()

      const exists = await surveyMongoRepository.loadById(FakeObjectId.toHexString())

      expect(exists).toBeFalsy()
    })
  })

  describe('loadAnswers()', () => {
    test('Should load answers on success', async () => {
      const surveyId = await mockSurveyId()

      const surveyMongoRepository = makeSurveyMongoRepository()
      const answers = await surveyMongoRepository.loadAnswers(surveyId)

      expect(answers).toEqual([mockAnswers()[0].answer, mockAnswers()[1].answer])
    })

    test('Should return empty if survey not exists', async () => {
      const surveyMongoRepository = makeSurveyMongoRepository()
      const FakeObjectId = new BsonObjectId()

      const exists = await surveyMongoRepository.loadAnswers(FakeObjectId.toHexString())

      expect(exists).toEqual([])
    })
  })

  describe('checkById()', () => {
    test('Should return true if survey exists', async () => {
      const surveyId = await mockSurveyId()

      const surveyMongoRepository = makeSurveyMongoRepository()
      const exists = await surveyMongoRepository.checkById(surveyId)

      expect(exists).toBe(true)
    })

    test('Should return false if survey not exists', async () => {
      const surveyMongoRepository = makeSurveyMongoRepository()
      const FakeObjectId = new BsonObjectId()

      const exists = await surveyMongoRepository.checkById(FakeObjectId.toHexString())

      expect(exists).toBe(false)
    })
  })
})
