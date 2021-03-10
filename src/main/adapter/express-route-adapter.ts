import { HttpRequest, HttpResponse } from './../../presentation/protocols/http'
import { Response, Request } from 'express'
import { Controller } from '../../presentation/protocols'

export const adapterRoute = (controller: Controller) => {
  return async (req: Request, res: Response) => {
    const httpRequest: HttpRequest = {
      body: req.body
    }

    const httpResponse: HttpResponse = await controller.handle(httpRequest)

    res.status(httpResponse.statusCode).json(httpResponse.body)
  }
}
