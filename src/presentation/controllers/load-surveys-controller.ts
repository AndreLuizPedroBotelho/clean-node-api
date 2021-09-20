
import { Controller, HttpResponse, HttpRequest } from '@/presentation/protocols'
import { noContent, serverError, ok } from '@/presentation/helpers'
import { LoadSurveys } from '@/domain/usecases'

export class LoadSurveysController implements Controller {
  constructor(
    private readonly loadSurveys: LoadSurveys

  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { accountId } = httpRequest
      const surveys = await this.loadSurveys.load(accountId)

      if (surveys.length === 0) {
        return noContent()
      }

      return ok(surveys)
    } catch (error) {
      return serverError(error)
    }
  }
}
