import { adapterResolver } from './../../adapters/apollo-server-resolver-adapter'
import { makeSignUpController, makeLoginController } from '@/main/factories/controllers'

export default {
  Query: {
    login: async (parent: any, args: any) => await adapterResolver(makeLoginController(), args)
  },
  Mutation: {
    signUp: async (parent: any, args: any) => await adapterResolver(makeSignUpController(), args)
  }
}
