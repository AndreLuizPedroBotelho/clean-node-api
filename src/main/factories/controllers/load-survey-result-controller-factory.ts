
import { makeLogControllerDecorator } from '@/main/factories/decorators'
import { makeDbLoadSurveyResult, makeDbCheckSurveyById } from '@/main/factories/usecases'
import { Controller } from '@/presentation/protocols'
import { LoadSurveyResultController } from '@/presentation/controllers'

export const makeLoadSurveyResultController = (): Controller => {
  const loadSurveyController = new LoadSurveyResultController(makeDbCheckSurveyById(), makeDbLoadSurveyResult())

  return makeLogControllerDecorator(loadSurveyController)
}
