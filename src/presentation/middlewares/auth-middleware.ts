import { AccessDeniedError } from '../errors'
import { forbidden } from './../helpers/http/http-helper'
import { HttpResponse, HttpRequest, Middleware } from './../protocols'

export class AuthMiddleware implements Middleware {
  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    return await new Promise((resolve, reject) => {
      resolve(forbidden(new AccessDeniedError()))
    })
  }
}
