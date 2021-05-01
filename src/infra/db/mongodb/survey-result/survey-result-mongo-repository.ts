
import { SaveSurveyResultRepository } from '@/data/protocols/db/survey-result/save-survey-result-repository'
import { SurveyResultModel } from '@/domain/models/survey-result'
import { SaveSurveyResultModel } from '@/domain/usecases/survey-result/save-survey-result'
import { MongoHelper } from '../helpers/mongo-helper'

export class SurveyResultMongoRepository implements SaveSurveyResultRepository {
  async save (data: SaveSurveyResultModel): Promise<SurveyResultModel> {
    const { surveyId, accountId, answer, date } = data
    const surveyCollection = await MongoHelper.getCollection('surveyResults')

    const res = await surveyCollection.findOneAndUpdate({
      surveyId,
      accountId
    }, {
      $set: {
        answer,
        date
      }
    }, {
      upsert: true,
      returnOriginal: false
    })

    return res.value && MongoHelper.map(res.value)
  }
}
