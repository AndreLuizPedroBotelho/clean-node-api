import { SurveyModel } from './../../../src/domain/models/survey'
import { ApolloServer, gql } from 'apollo-server-express'
import { makeApolloServer } from './helpers'
import { Collection } from 'mongodb'
import { MongoHelper } from '@/infra/db'
import { createTestClient } from 'apollo-server-integration-testing'
import env from '@/main/config/env'
import { sign } from 'jsonwebtoken'

let surveyCollection: Collection
let accountCollection: Collection
let apolloServer: ApolloServer

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
    apolloServer = makeApolloServer()
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
    const surveyResultQuery = gql`
        query surveyResult($surveyId:String!){
          surveyResult(surveyId:$surveyId){
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

      const { query } = createTestClient({
        apolloServer,
        extendMockRequest: {
          headers: {
            'x-access-token': accessToken
          }
        }
      })

      const res: any = await query(surveyResultQuery, {
        variables: {
          surveyId: survey.id.toString()
        }
      })

      expect(res.data.surveyResult.question).toBe('Question')
      expect(res.data.surveyResult.date).toBe(now.toISOString())
      expect(res.data.surveyResult.answers).toEqual([{
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

      const { query } = createTestClient({
        apolloServer
      })

      const res: any = await query(surveyResultQuery, {
        variables: {
          surveyId: survey.id.toString()
        }
      })

      expect(res.data).toBeFalsy()
      expect(res.errors[0].message).toBe('Access Denied')
    })
  })
  describe('SurveyResult Mutation', () => {
    const saveSurveyResultQuery = gql`
        mutation saveSurveyResult($surveyId:String!,$answer:String!){
          saveSurveyResult(surveyId:$surveyId,answer:$answer){
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

      const { mutate } = createTestClient({
        apolloServer,
        extendMockRequest: {
          headers: {
            'x-access-token': accessToken
          }
        }
      })

      const res: any = await mutate(saveSurveyResultQuery, {
        variables: {
          surveyId: survey.id.toString(),
          answer: 'Answer 1'
        }
      })

      expect(res.data.saveSurveyResult.question).toBe('Question')
      expect(res.data.saveSurveyResult.date).toBe(now.toISOString())
      expect(res.data.saveSurveyResult.answers).toEqual([{
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

      const { mutate } = createTestClient({
        apolloServer
      })

      const res: any = await mutate(saveSurveyResultQuery, {
        variables: {
          surveyId: survey.id.toString(),
          answer: 'Answer 1'
        }
      })

      expect(res.data).toBeFalsy()
      expect(res.errors[0].message).toBe('Access Denied')
    })
  })
})
