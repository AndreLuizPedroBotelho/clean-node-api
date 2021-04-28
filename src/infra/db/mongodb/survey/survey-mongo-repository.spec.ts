import { Collection } from 'mongodb'
import { MongoHelper } from '../helpers/mongo-helper'
import { SurveyMongoRepository } from './survey-mongo-repository'

let surveyCollection: Collection

const makeSurveyMongoRepository = (): SurveyMongoRepository => {
  return new SurveyMongoRepository()
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
      await surveyCollection.insertMany([{
        question: 'any_question',
        answers: [{
          image: 'any_image',
          answer: 'any_answer'
        },
        {
          answer: 'any_answer'
        }],
        date: new Date()
      }, {
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

      const surveyMongoRepository = makeSurveyMongoRepository()
      const surveys = await surveyMongoRepository.loadAll()

      expect(surveys.length).toBe(2)
    })
    test('Should load empty list', async () => {
      const surveyMongoRepository = makeSurveyMongoRepository()
      const surveys = await surveyMongoRepository.loadAll()

      expect(surveys.length).toBe(0)
    })
  })
})
