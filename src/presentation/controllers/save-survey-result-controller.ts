import { Controller, HttpResponse } from '@/presentation/protocols'
import { forbidden, serverError, ok } from '@/presentation/helpers'
import { InvalidParamError } from '@/presentation/errors'
import { LoadSurveyById, SaveSurveyResult } from '@/domain/usecases'

export class SaveSurveyResultController implements Controller {
  constructor(
    private readonly loadSurveyById: LoadSurveyById,
    private readonly saveSurveyResult: SaveSurveyResult
  ) { }

  async handle(request: SaveSurveyResultController.Request): Promise<HttpResponse> {
    try {
      const { surveyId, answer, accountId } = request

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

export namespace SaveSurveyResultController {
  export type Request = {
    surveyId: string
    accountId: string
    answer: string
  }
}
