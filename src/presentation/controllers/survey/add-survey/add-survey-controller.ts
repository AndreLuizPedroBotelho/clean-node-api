import { badRequest } from '../../../helpers/http/http-helper'
import { Controller, HttpResponse, HttpRequest, Validation } from './add-survey-controller-protocols'

export class AddSurveyController implements Controller {
  constructor (
    private readonly validation: Validation
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const error = this.validation.validate(httpRequest.body)
    console.log(error)

    if (error) {
      return badRequest(error)
    }

    return await new Promise(resolve => resolve(null as unknown as HttpResponse))
  }
}
