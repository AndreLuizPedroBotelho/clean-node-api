import { Collection } from 'mongodb'
import { MongoHelper } from '@/infra/db'
import env from '@/main/config/env'
import { sign } from 'jsonwebtoken'
import request from 'supertest'
import { setupApp } from '@/main/config/app'
import { Express } from 'express'

let surveyCollection: Collection
let accountCollection: Collection
let app: Express

const mockAccessToken = async (): Promise<string> => {
  const res = await accountCollection.insertOne({
    name: 'André',
    email: 'andre@hotmail.com',
    password: '123',
    role: 'admin'
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

const mockSurvey = async (now): Promise<void> => {
  await surveyCollection.insertOne({
    question: 'Question',
    answers: [{
      image: 'http://image-name.com',
      answer: 'Answer 1'
    }, {
      answer: 'Answer 2'
    }],
    date: now
  })
}

describe('Survey GraphQL', () => {
  beforeAll(async () => {
    app = await setupApp()

    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyCollection = MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})

    accountCollection = MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('Survey Query', () => {
    const query = `
        query{
          surveys{
            id
            question
            answers{
              image
              answer
            }
            date
            didAnswer
          }
        }
    `

    test('Should return Surveys', async () => {
      const now = new Date()

      await mockSurvey(now)

      const accessToken = await mockAccessToken()

      const res = await request(app)
        .post('/graphql')
        .set('x-access-token', accessToken)
        .send({
          query
        })

      expect(res.body.data.surveys.length).toBe(1)

      expect(res.body.data.surveys[0].id).toBeTruthy()
      expect(res.body.data.surveys[0].question).toBe('Question')
      expect(res.body.data.surveys[0].date).toBe(now.toISOString())
      expect(res.body.data.surveys[0].didAnswer).toBe(false)
      expect(res.body.data.surveys[0].answers).toEqual([{
        image: 'http://image-name.com',
        answer: 'Answer 1'
      }, {
        answer: 'Answer 2',
        image: null
      }])
    })
    test('Should return AccessDeniedError if no token is provided', async () => {
      const now = new Date()

      await mockSurvey(now)

      const res = await request(app)
        .post('/graphql')
        .send({
          query
        })

      expect(res.status).toBe(403)
      expect(res.body.data).toBeFalsy()
      expect(res.body.errors[0].message).toBe('Access Denied')
    })
  })
})
