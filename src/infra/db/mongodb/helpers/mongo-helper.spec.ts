import { MongoHelper as mongoHelper } from './mongo-helper'

describe('MongoHelper', () => {
  beforeAll(async () => {
    await mongoHelper.connect(process.env.MONGO_URL as string)
  })

  afterAll(async () => {
    await mongoHelper.disconnect()
  })

  test('Should reconnect if mongodb is down', async () => {
    let accountCollection = await mongoHelper.getCollection('accounts')
    expect(accountCollection).toBeTruthy()

    await mongoHelper.disconnect()

    accountCollection = await mongoHelper.getCollection('accounts')
    expect(accountCollection).toBeTruthy()
  })
})
