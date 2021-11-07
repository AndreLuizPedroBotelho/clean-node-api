import { SurveyModel } from '@/domain/models'
import { changeParams } from './helpers'
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

const mockSurvey = async (now): Promise<SurveyModel> => {
  const res = await surveyCollection.insertOne({
    question: 'Question',
    answers: [{
      image: 'http://image-name.com',
      answer: 'Answer 1'
    }, {
      answer: 'Answer 2'
    }],
    date: now
  })

  const survey = await surveyCollection.findOne({ _id: res.insertedId })

  return MongoHelper.map(survey)
}

describe('SurveyResult GraphQL', () => {
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

  describe('SurveyResult Query', () => {
    const query = `
        query {
          surveyResult(surveyId: "$surveyId"){
            question
            answers{
              answer
              count
              percent
              isCurrentAccountAnswer
            }
            date
          }
        }
    `

    test('Should return SurveyResult', async () => {
      const now = new Date()

      const survey = await mockSurvey(now)

      const accessToken = await mockAccessToken()

      const res = await request(app)
        .post('/graphql')
        .set('x-access-token', accessToken)
        .send({
          query: changeParams(query, {
            surveyId: survey.id.toString()
          })
        })

      expect(res.status).toBe(200)
      expect(res.body.data.surveyResult.question).toBe('Question')
      expect(res.body.data.surveyResult.date).toBe(now.toISOString())
      expect(res.body.data.surveyResult.answers).toEqual([{
        answer: 'Answer 1',
        count: 0,
        percent: 0,
        isCurrentAccountAnswer: false
      }, {
        answer: 'Answer 2',
        count: 0,
        percent: 0,
        isCurrentAccountAnswer: false
      }])
    })
    test('Should return AccessDeniedError if no token is provided', async () => {
      const now = new Date()

      const survey = await mockSurvey(now)

      const res = await request(app)
        .post('/graphql')
        .send({
          query: changeParams(query, {
            surveyId: survey.id.toString()
          })
        })

      expect(res.status).toBe(403)
      expect(res.body.data).toBeFalsy()
      expect(res.body.errors[0].message).toBe('Access Denied')
    })
  })
  describe('SurveyResult Mutation', () => {
    const query = `
        mutation{
          saveSurveyResult(surveyId:"$surveyId",answer:"$answer"){
            question
            answers{
              answer
              count
              percent
              isCurrentAccountAnswer
            }
            date
          }
        }
    `

    test('Should return SurveyResult', async () => {
      const now = new Date()

      const survey = await mockSurvey(now)

      const accessToken = await mockAccessToken()

      const res = await request(app)
        .post('/graphql')
        .set('x-access-token', accessToken)
        .send({
          query: changeParams(query, {
            surveyId: survey.id.toString(),
            answer: 'Answer 1'
          })
        })

      expect(res.body.data.saveSurveyResult.question).toBe('Question')
      expect(res.body.data.saveSurveyResult.date).toBe(now.toISOString())
      expect(res.body.data.saveSurveyResult.answers).toEqual([{
        answer: 'Answer 1',
        count: 1,
        percent: 100,
        isCurrentAccountAnswer: true
      }, {
        answer: 'Answer 2',
        count: 0,
        percent: 0,
        isCurrentAccountAnswer: false
      }])
    })

    test('Should return AccessDeniedError if no token is provided', async () => {
      const now = new Date()

      const survey = await mockSurvey(now)

      const res = await request(app)
        .post('/graphql')
        .send({
          query: changeParams(query, {
            surveyId: survey.id.toString(),
            answer: 'Answer 1'
          })
        })

      expect(res.status).toBe(403)
      expect(res.body.data).toBeFalsy()
      expect(res.body.errors[0].message).toBe('Access Denied')
    })
  })
})
