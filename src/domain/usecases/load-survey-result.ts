import { SurveyResultModel } from '@/domain/models'

export interface LoadSurveyResult {
  load(surveyId: String, accountId: string): Promise<LoadSurveyResult.Result>
}

export namespace LoadSurveyResult {
  export type Result = SurveyResultModel
}
