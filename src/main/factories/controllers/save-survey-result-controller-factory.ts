import { makeLogControllerDecorator } from '@/main/factories/decorators'
import { Controller } from '@/presentation/protocols'
import { SaveSurveyResultController } from '@/presentation/controllers'
import { makeDbSaveSurveyResult, makeDbLoadAnswersBySurvey } from '@/main/factories/usecases'

export const makeSaveSurveyResultController = (): Controller => {
  const addSurveyController = new SaveSurveyResultController(makeDbLoadAnswersBySurvey(), makeDbSaveSurveyResult())

  return makeLogControllerDecorator(addSurveyController)
}
