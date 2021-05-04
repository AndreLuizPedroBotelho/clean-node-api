import { forbidden, ok, serverError } from '@/presentation/helpers/http/http-helper'
import {
  Controller,
  HttpRequest,
  HttpResponse,
  SaveSurveyResult,
  LoadSurveyById,
  InvalidParamError
} from './save-survey-result-controller-protocols'

export class SaveSurveyResultController implements Controller {
  constructor (
    private readonly loadSurveyById: LoadSurveyById,
    private readonly saveSurveyResult: SaveSurveyResult
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { surveyId } = httpRequest.params
      const { answer } = httpRequest.body
      const accountId: string = httpRequest.accountId as string

      const survey = await this.loadSurveyById.loadById(surveyId)

      if (survey) {
        if (!survey.answers.some(elem => elem.answer === answer)) {
          return forbidden(new InvalidParamError('surveyId'))
        }

        const surveyResult = await this.saveSurveyResult.save({
          surveyId: survey.id,
          accountId,
          answer,
          date: new Date()
        })

        return ok(surveyResult)
      }

      return forbidden(new InvalidParamError('surveyId'))
    } catch (error) {
      return serverError(error)
    }
  }
}
