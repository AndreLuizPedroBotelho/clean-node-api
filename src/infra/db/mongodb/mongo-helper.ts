import { Collection, MongoClient } from 'mongodb'

export const MongoHelper = {
  client: null,
  uri: null,

  async connect(url: string): Promise<void> {
    this.uri = url
    this.client = await MongoClient.connect(url)
  },

  async disconnect(): Promise<void> {
    await this.client.close()
    this.client = null
  },

  getCollection(name: string): Collection {
    return this.client.db().collection(name)
  },

  map(data: any): any {
    const { _id, ...collectionWithoutId } = data

    return Object.assign({}, collectionWithoutId, { id: _id })
  },

  mapCollection(collection: any[]): any[] {
    return collection.map(data => MongoHelper.map(data))
  }
}
