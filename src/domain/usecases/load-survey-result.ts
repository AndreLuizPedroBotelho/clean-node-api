import { SurveyResultModel } from '@/domain/models'

export interface LoadSurveyResult {
  load(surveyId: String, accountId: string): Promise<SurveyResultModel>
}
