import { Collection } from 'mongodb'
import { MongoHelper } from '../helpers'

import { AccountModel } from '@/domain/models/account'
import { AccountMongoRepository } from './account-mongo-repository'
import { mockAccountParams, mockAccountWithTokenParams } from '@/domain/test'

let accountCollection: Collection

const makeAccountMongoRepository = (): AccountMongoRepository => {
  return new AccountMongoRepository()
}

const makeFakeAccount = async (): Promise<AccountModel> => {
  const res = await accountCollection.insertOne(mockAccountParams())

  return MongoHelper.map(res.ops[0])
}

const loadFakeAccountById = async (id: string): Promise<AccountModel> => {
  const account = await accountCollection.findOne({ _id: id })
  return MongoHelper.map(account)
}
describe('Account Mongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL as string)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = await MongoHelper.getCollection('accounts')

    await accountCollection.deleteMany({})
  })

  describe('add()', () => {
    test('Should return an account on add success', async () => {
      const accountMongoRepository = makeAccountMongoRepository()
      const account = await accountMongoRepository.add(mockAccountParams())

      expect(account).toBeTruthy()
      expect(account.id).toBeTruthy()

      expect(account.name).toBe('any_name')
      expect(account.email).toBe('any_email@mail.com')
      expect(account.password).toBe('any_password')
    })
  })

  describe('loadByEmail()', () => {
    test('Should return an account on loadByEmail success', async () => {
      const accountMongoRepository = makeAccountMongoRepository()

      await makeFakeAccount()
      const account = await accountMongoRepository.loadByEmail('any_email@mail.com')

      expect(account).toBeTruthy()
      expect(account.id).toBeTruthy()

      expect(account.name).toBe('any_name')
      expect(account.email).toBe('any_email@mail.com')
      expect(account.password).toBe('any_password')
    })
    test('Should return null if loadByEmail', async () => {
      const accountMongoRepository = makeAccountMongoRepository()

      const account = await accountMongoRepository.loadByEmail('any_email@mail.com')

      expect(account).toBeFalsy()
    })
  })

  describe('updateAccessToken', () => {
    test('Should update the account accessToken on updateAccessToken success ', async () => {
      const accountMongoRepository = makeAccountMongoRepository()

      const { id, accessToken } = await makeFakeAccount()

      expect(accessToken).toBeFalsy()

      await accountMongoRepository.updateAccessToken(id, 'any_token')

      const account = await loadFakeAccountById(id)

      expect(account).toBeTruthy()
      expect(account.accessToken).toBe('any_token')
    })
  })

  describe('loadByToken()', () => {
    test('Should return an account on loadByToken success without role', async () => {
      const accountMongoRepository = makeAccountMongoRepository()

      await accountCollection.insertOne({
        ...mockAccountWithTokenParams()
      })

      const account = await accountMongoRepository.loadByToken('any_token')

      expect(account).toBeTruthy()
      expect(account.id).toBeTruthy()

      expect(account.name).toBe('any_name')
      expect(account.email).toBe('any_email@mail.com')
      expect(account.password).toBe('any_password')
    })

    test('Should return an account on loadByToken success with admin role', async () => {
      const accountMongoRepository = makeAccountMongoRepository()

      await accountCollection.insertOne({
        role: 'admin',
        ...mockAccountWithTokenParams()
      })

      const account = await accountMongoRepository.loadByToken('any_token', 'admin')

      expect(account).toBeTruthy()
      expect(account.id).toBeTruthy()

      expect(account.name).toBe('any_name')
      expect(account.email).toBe('any_email@mail.com')
      expect(account.password).toBe('any_password')
    })

    test('Should return null on loadByToken with invalid role', async () => {
      const accountMongoRepository = makeAccountMongoRepository()

      await accountCollection.insertOne({
        ...mockAccountWithTokenParams()
      })

      const account = await accountMongoRepository.loadByToken('any_token', 'admin')

      expect(account).toBeFalsy()
    })

    test('Should return an account on loadByToken with if user is admin', async () => {
      const accountMongoRepository = makeAccountMongoRepository()

      await accountCollection.insertOne({
        role: 'admin',
        ...mockAccountWithTokenParams()
      })

      const account = await accountMongoRepository.loadByToken('any_token')

      expect(account).toBeTruthy()
      expect(account.id).toBeTruthy()

      expect(account.name).toBe('any_name')
      expect(account.email).toBe('any_email@mail.com')
      expect(account.password).toBe('any_password')
    })

    test('Should return null if loadByToken', async () => {
      const accountMongoRepository = makeAccountMongoRepository()

      const account = await accountMongoRepository.loadByToken('any_token', 'any_role')

      expect(account).toBeFalsy()
    })
  })
})
