
import { makeLogControllerDecorator } from '@/main/factories/decorators'
import { makeDbLoadSurveyResult, makeDbLoadSurveyById } from '@/main/factories/usecases'
import { Controller } from '@/presentation/protocols'
import { LoadSurveyResultController } from '@/presentation/controllers'

export const makeLoadSurveyResultController = (): Controller => {
  const loadSurveyController = new LoadSurveyResultController(makeDbLoadSurveyById(), makeDbLoadSurveyResult())

  return makeLogControllerDecorator(loadSurveyController)
}
