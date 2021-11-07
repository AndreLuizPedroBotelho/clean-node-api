import { Collection } from 'mongodb'
import request from 'supertest'
import { AccountModel } from '@/domain/models'
import { MongoHelper } from '@/infra/db'

import { setupApp } from '@/main/config/app'
import { hash } from 'bcrypt'
import { Express } from 'express'

let accountCollection: Collection
let app: Express

describe('Login Routes', () => {
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

    const account = await accountCollection.findOne({ _id: res.insertedId })

    return MongoHelper.map(account)
  }
  describe('POST /signup', () => {
    test('Should return 200 on signup', async () => {
      await request(app)
        .post('/api/signup')
        .send({
          name: 'André',
          email: 'andre@hotmail.com',
          password: '123',
          passwordConfirmation: '123'
        })
        .expect(200)
    })
  })

  describe('POST /login', () => {
    test('Should return 200 on login', async () => {
      await mockAccount()
      await request(app)
        .post('/api/login')
        .send({
          email: 'andre@hotmail.com',
          password: '123'
        })
        .expect(200)
    })

    test('Should return 401 on login', async () => {
      await request(app)
        .post('/api/login')
        .send({
          email: 'andre@hotmail.com',
          password: '123'
        })
        .expect(401)
    })
  })
})
