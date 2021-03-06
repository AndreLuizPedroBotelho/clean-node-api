import { makeDbLoadSurveys } from '@/main/factories/usecases/survey/load-surveys/db-load-surveys-factory'
import { LoadSurveysController } from '@/presentation/controllers/survey/load-survey/load-surveys-controller'
import { makeLogControllerDecorator } from '@/main/factories/decorators/log-controller-decorator-factory'
import { Controller } from '@/presentation/protocols'

export const makeLoadSurveysController = (): Controller => {
  const addSurveyController = new LoadSurveysController(makeDbLoadSurveys())

  return makeLogControllerDecorator(addSurveyController)
}
