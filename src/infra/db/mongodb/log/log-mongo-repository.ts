import { LogErrorRepository } from '@/data/protocols/db/log/log-error-repository'
import { MongoHelper } from '../helpers'

export class LogMongoRepository implements LogErrorRepository {
  async logError(stack: string): Promise<void> {
    const accountCollection = await MongoHelper.getCollection('errors')

    await accountCollection.insertOne({
      stack,
      date: new Date()
    })
  }
}
