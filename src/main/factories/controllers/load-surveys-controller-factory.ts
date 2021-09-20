import { makeDbLoadSurveys } from '@/main/factories/usecases'
import { LoadSurveysController } from '@/presentation/controllers'
import { makeLogControllerDecorator } from '@/main/factories/decorators'
import { Controller } from '@/presentation/protocols'

export const makeLoadSurveysController = (): Controller => {
  const addSurveyController = new LoadSurveysController(makeDbLoadSurveys())

  return makeLogControllerDecorator(addSurveyController)
}
