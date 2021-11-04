import { adapterResolver } from '../../adapters/apollo-server-resolver-adapter'
import { makeLoadSurveyResultController, makeSaveSurveyResultController } from '@/main/factories/controllers'

export default {
  Query: {
    surveyResult: async (parent: any, args: any) => await adapterResolver(makeLoadSurveyResultController(), args)
  },
  Mutation: {
    saveSurveyResult: async (parent: any, args: any) => await adapterResolver(makeSaveSurveyResultController(), args)
  }
}
