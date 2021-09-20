import { makeLogControllerDecorator } from '@/main/factories/decorators'
import { Controller } from '@/presentation/protocols'
import { SaveSurveyResultController } from '@/presentation/controllers'
import { makeDbSaveSurveyResult, makeDbLoadSurveyById } from '@/main/factories/usecases'

export const makeSaveSurveyResultController = (): Controller => {
  const addSurveyController = new SaveSurveyResultController(makeDbLoadSurveyById(), makeDbSaveSurveyResult())

  return makeLogControllerDecorator(addSurveyController)
}
