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

  const { id } = MongoHelper.map(res.ops[0])
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
    apolloServer = makeApolloServer()
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveyCollection = await MongoHelper.getCollection('surveys')
    await surveyCollection.deleteMany({})

    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('Survey Query', () => {
    const surveysQuery = gql`
        query surveys{
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
      const { query } = createTestClient({
        apolloServer,
        extendMockRequest: {
          headers: {
            'x-access-token': accessToken
          }
        }

      })

      const res: any = await query(surveysQuery)

      expect(res.data.surveys.length).toBe(1)

      expect(res.data.surveys[0].id).toBeTruthy()
      expect(res.data.surveys[0].question).toBe('Question')
      expect(res.data.surveys[0].date).toBe(now.toISOString())
      expect(res.data.surveys[0].didAnswer).toBe(false)
      expect(res.data.surveys[0].answers).toEqual([{
        image: 'http://image-name.com',
        answer: 'Answer 1'
      }, {
        answer: 'Answer 2',
        image: null
      }])
    })
  })
})
