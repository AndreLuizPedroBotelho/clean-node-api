import { Collection } from 'mongodb'
import { MongoHelper, LogMongoRepository } from '@/infra/db'

describe('Log Mongo Repository', () => {
  let errorCollection: Collection
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    errorCollection = MongoHelper.getCollection('errors')

    await errorCollection.deleteMany({})
  })

  const makeLogMongoRepository = (): LogMongoRepository => {
    return new LogMongoRepository()
  }
  test('Should create an error log an success', async () => {
    const logMongoRepository = makeLogMongoRepository()
    await logMongoRepository.logError('any_stack')
    const count = await errorCollection.countDocuments()

    expect(count).toBe(1)
  })
})
