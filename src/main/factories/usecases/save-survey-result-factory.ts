import { DbSaveSurveyResult } from '@/data/usecases'
import { SurveyResultMongoRepository } from '@/infra/db'

import { SaveSurveyResult } from '@/domain/usecases'

export const makeDbSaveSurveyResult = (): SaveSurveyResult => {
  const surveyResultMongoRepository = new SurveyResultMongoRepository()

  return new DbSaveSurveyResult(surveyResultMongoRepository, surveyResultMongoRepository)
}
