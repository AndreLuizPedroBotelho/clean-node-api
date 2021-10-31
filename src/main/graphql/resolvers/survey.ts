import { adapterResolver } from './../../adapters/apollo-server-resolver-adapter'
import { makeLoadSurveysController } from '@/main/factories/controllers'

export default {
  Query: {
    surveys: async () => await adapterResolver(makeLoadSurveysController())
  }
}
