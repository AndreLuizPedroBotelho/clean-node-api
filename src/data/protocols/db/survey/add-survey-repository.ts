import { AddSurvey } from '@/domain/usecases'

export interface AddSurveyRepository {
  add(survey: AddSurveyRepository.Params): Promise<void>
}

export namespace AddSurveyRepository {
  export type Params = AddSurvey.Params
}
