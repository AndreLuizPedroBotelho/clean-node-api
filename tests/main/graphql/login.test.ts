import { ApolloServer, gql } from 'apollo-server-express'
import { makeApolloServer } from './helpers'
import { Collection } from 'mongodb'
import { AccountModel } from '@/domain/models'
import { MongoHelper } from '@/infra/db'
import { hash } from 'bcrypt'
import { createTestClient } from 'apollo-server-integration-testing'

let accountCollection: Collection
let apolloServer: ApolloServer

describe('Login GraphQL', () => {
  beforeAll(async () => {
    apolloServer = makeApolloServer()
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = await MongoHelper.getCollection('accounts')

    await accountCollection.deleteMany({})
  })

  const mockAccount = async (): Promise<AccountModel> => {
    const password = await hash('123', 12)

    const res = await accountCollection.insertOne({
      name: 'André',
      email: 'andre@hotmail.com',
      password
    })

    return MongoHelper.map(res.ops[0])
  }
  describe('Login Query', () => {
    const loginQuery = gql`
        query login($email:String!,$password:String!){
          login(email:$email,password:$password){
            accessToken
            name
          }
        }
    `
    test('Should return an Account on valid credentials', async () => {
      await mockAccount()

      const { query } = createTestClient({ apolloServer })

      const res: any = await query(loginQuery, {
        variables: {
          email: 'andre@hotmail.com',
          password: '123'
        }
      })

      expect(res.data.login.accessToken).toBeTruthy()
      expect(res.data.login.name).toBe('André')
    })

    test('Should return UnauthorizedError on invalid credentials', async () => {
      const { query } = createTestClient({ apolloServer })

      const res: any = await query(loginQuery, {
        variables: {
          email: 'andre@hotmail.com',
          password: '123'
        }
      })

      expect(res.data).toBeFalsy()
      expect(res.errors[0].message).toBe('Unauthorized')
    })
  })
})
