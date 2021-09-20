import { SurveyResultModel } from '@/domain/models/survey-result'

export interface LoadSurveyResult {
  load(surveyId: String, accountId: string): Promise<SurveyResultModel>
}
