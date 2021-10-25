import { DbLoadAnswersBySurvey } from '@/data/usecases'
import { SurveyMongoRepository } from '@/infra/db'

import { LoadAnswersBySurvey } from '@/domain/usecases'

export const makeDbLoadAnswersBySurvey = (): LoadAnswersBySurvey => {
  const surveyMongoRepository = new SurveyMongoRepository()

  return new DbLoadAnswersBySurvey(surveyMongoRepository)
}
