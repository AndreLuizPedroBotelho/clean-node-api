import { AddSurveyModel } from '../../../usecases/add-survey/db-add-survey-protocols'

export interface AddSurveyRepository{
  add (survey: AddSurveyModel): Promise<void>
}
