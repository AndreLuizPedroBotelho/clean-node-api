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
    accountCollection = MongoHelper.getCollection('accounts')

    await accountCollection.deleteMany({})
  })

  const mockAccount = async (): Promise<AccountModel> => {
    const password = await hash('123', 12)

    const res = await accountCollection.insertOne({
      name: 'André',
      email: 'andre@hotmail.com',
      password
    })

    const account = await accountCollection.findOne({ id: res.insertedId })

    return account as AccountModel
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

  describe('SignUp Mutation', () => {
    const signUpMutation = gql`
        mutation signUp($name:String!,$email:String!,$password:String!,$passwordConfirmation:String!){
          signUp(name:$name,email:$email,password:$password,passwordConfirmation:$passwordConfirmation){
            accessToken
            name
          }
        }
    `
    test('Should return an Account on valid data', async () => {
      const { mutate } = createTestClient({ apolloServer })

      const res: any = await mutate(signUpMutation, {
        variables: {
          name: 'André',
          email: 'andre@hotmail.com',
          password: '123',
          passwordConfirmation: '123'
        }
      })

      expect(res.data.signUp.accessToken).toBeTruthy()
      expect(res.data.signUp.name).toBe('André')
    })

    test('Should return EmailInUseError on invalid data', async () => {
      await mockAccount()

      const { mutate } = createTestClient({ apolloServer })

      const res: any = await mutate(signUpMutation, {
        variables: {
          name: 'André',
          email: 'andre@hotmail.com',
          password: '123',
          passwordConfirmation: '123'
        }
      })

      expect(res.data).toBeFalsy()
      expect(res.errors[0].message).toBe('The received email is already in use')
    })
  })
})
