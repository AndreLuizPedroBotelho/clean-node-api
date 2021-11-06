import { LogErrorRepository } from '@/data/protocols'
import { MongoHelper } from '@/infra/db'

export class LogMongoRepository implements LogErrorRepository {
  async logError(stack: string): Promise<void> {
    const accountCollection = MongoHelper.getCollection('errors')

    await accountCollection.insertOne({
      stack,
      date: new Date()
    })
  }
}
