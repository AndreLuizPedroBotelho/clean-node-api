import { AddSurveyParams } from '@/domain/usecases'

export interface AddSurveyRepository {
  add(survey: AddSurveyParams): Promise<void>
}
