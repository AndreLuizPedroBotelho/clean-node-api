import { forbidden, ok, serverError } from '@/presentation/helpers/http/http-helper'
import {
  Controller,
  HttpRequest,
  HttpResponse,
  LoadSurveyById,
  InvalidParamError,
  LoadSurveyResult
} from './load-survey-result-controller-protocols'

export class LoadSurveyResultController implements Controller {
  constructor(
    private readonly loadSurveyById: LoadSurveyById,
    private readonly loadSurveyResult: LoadSurveyResult
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { accountId, params } = httpRequest
      const { surveyId } = params

      const survey = await this.loadSurveyById.loadById(surveyId)

      if (!survey) {
        return forbidden(new InvalidParamError('surveyId'))
      }

      const surveyResult = await this.loadSurveyResult.load(surveyId, accountId as string)

      return ok(surveyResult)
    } catch (error) {
      return serverError(error)
    }
  }
}
