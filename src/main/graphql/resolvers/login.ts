import { adapterResolver } from './../../adapters/apollo-server-resolver-adapter'
import { makeLoginController } from '@/main/factories/controllers'

export default {
  Query: {
    login: async (parent: any, args: any) => await adapterResolver(makeLoginController(), args)
  }
}
