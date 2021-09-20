import { Controller, HttpResponse, HttpRequest, Validation } from '@/presentation/protocols'
import { badRequest, serverError, unauthorized, ok } from '@/presentation/helpers'
import { Authentication } from '@/domain/usecases'

export class LoginController implements Controller {
  constructor(
    private readonly authentication: Authentication,
    private readonly validation: Validation
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)

      if (error) {
        return badRequest(error)
      }

      const { email, password } = httpRequest.body

      const authorization = await this.authentication.auth({ email, password })

      if (!authorization) {
        return unauthorized()
      }

      return ok(authorization)
    } catch (error) {
      return serverError(error)
    }
  }
}
