import { changeParams } from './helpers'
import { Collection } from 'mongodb'
import { AccountModel } from '@/domain/models'
import { MongoHelper } from '@/infra/db'
import { hash } from 'bcrypt'
import request from 'supertest'
import { setupApp } from '@/main/config/app'
import { Express } from 'express'

let accountCollection: Collection
let app: Express

describe('Login GraphQL', () => {
  beforeAll(async () => {
    app = await setupApp()

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
    const query = `
        query {
          login(email:"$email",password:"$password"){
            accessToken
            name
          }
        }
    `
    test('Should return an Account on valid credentials', async () => {
      await mockAccount()

      const res = await request(app)
        .post('/graphql')
        .send({
          query: changeParams(query, {
            email: 'andre@hotmail.com',
            password: '123'
          })
        })

      expect(res.status).toBe(200)
      expect(res.body.data.login.accessToken).toBeTruthy()
      expect(res.body.data.login.name).toBe('André')
    })

    test('Should return UnauthorizedError on invalid credentials', async () => {
      const res = await request(app)
        .post('/graphql')
        .send({
          query: changeParams(query, {
            email: 'andre@hotmail.com',
            password: '123'
          })
        })

      expect(res.status).toBe(401)
      expect(res.body.data).toBeFalsy()
      expect(res.body.errors[0].message).toBe('Unauthorized')
    })
  })

  describe('SignUp Mutation', () => {
    const query = `
        mutation {
          signUp(name:"$name",email:"$email",password:"$password",passwordConfirmation:"$passwordConfirmation"){
            accessToken
            name
          }
        }
    `
    test('Should return an Account on valid data', async () => {
      const res = await request(app)
        .post('/graphql')
        .send({
          query: changeParams(query, {
            name: 'André',
            email: 'andre@hotmail.com',
            password: '123',
            passwordConfirmation: '123'
          })
        })

      expect(res.status).toBe(200)
      expect(res.body.data.signUp.accessToken).toBeTruthy()
      expect(res.body.data.signUp.name).toBe('André')
    })

    test('Should return EmailInUseError on invalid data', async () => {
      await mockAccount()

      const res = await request(app)
        .post('/graphql')
        .send({
          query: changeParams(query, {
            name: 'André',
            email: 'andre@hotmail.com',
            password: '123',
            passwordConfirmation: '123'
          })
        })

      expect(res.status).toBe(403)
      expect(res.body.data).toBeFalsy()
      expect(res.body.errors[0].message).toBe('The received email is already in use')
    })
  })
})
