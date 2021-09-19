import { Controller, HttpRequest, HttpResponse, Authentication, Validation } from './login-controller-protocols'

import { badRequest, ok, serverError, unauthorized } from '@/presentation/helpers/http/http-helper'

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
