import env from '@/main/config/env'
import { sign } from 'jsonwebtoken'
import { Collection } from 'mongodb'
import request from 'supertest'
import { MongoHelper } from '@/infra/db'

import app from '@/main/config/app'

let surveyCollection: Collection
let accountCollection: Collection
let surveyResultsCollection: Collection

const mockAccountLogin = async (): Promise<string> => {
  const res = await accountCollection.insertOne({
    name: 'André',
    email: 'andre@hotmail.com',
    password: '123'
  })

  const id = res.insertedId
  const accessToken = sign({ id }, env.jwtSecret)

  await accountCollection.updateOne({
    _id: id
  }, {
    $set: {
      accessToken
    }

  })

  return accessToken
}

const mockSurvey = async (): Promise<string> => {
  const res = await surveyCollection.insertOne({
    question: 'Question',
    answers: [{
      image: 'http://image-name.com',
      answer: 'Answer 1'
    }, {
      answer: 'Answer 2'
    }],
    date: new Date()
  })

  return res.insertedId.toHexString()
}

describe('Survey Routes', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})

    surveyCollection = MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})

    surveyResultsCollection = MongoHelper.getCollection('surveyResults')
    await surveyResultsCollection.deleteMany({})
  })

  describe('PUT /survey-result/:surveyId/results', () => {
    test('Should return 403 on save survey result without accessToken', async () => {
      await request(app)
        .put('/api/surveys/any_id/results')
        .send({
          answer: 'any_answer'
        })
        .expect(403)
    })

    test('Should return 200 on save survey result with accessToken', async () => {
      const accessToken = await mockAccountLogin()

      const surveId = await mockSurvey()

      await request(app)
        .put(`/api/surveys/${surveId}/results`)
        .set('x-access-token', accessToken)
        .send({
          answer: 'Answer 1'
        })
        .expect(200)
    })
  })

  describe('GET /survey-result/:surveyId/results', () => {
    test('Should return 403 on load survey result without accessToken', async () => {
      await request(app)
        .get('/api/surveys/any_id/results')
        .expect(403)
    })

    test('Should return 200 on load survey result with accessToken', async () => {
      const accessToken = await mockAccountLogin()

      const surveId = await mockSurvey()

      await request(app)
        .get(`/api/surveys/${surveId}/results`)
        .set('x-access-token', accessToken)
        .expect(200)
    })
  })
})
