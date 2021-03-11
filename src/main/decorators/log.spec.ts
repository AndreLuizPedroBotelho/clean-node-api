import { HttpRequest, HttpResponse, Controller } from '../../presentation/protocols'
import { LogControlerDecorator } from './log'
describe('LogCOntroller Decorator', () => {
  test('Should call controller hamdle', async () => {
    class ControllerStub implements Controller {
      async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
        const httpResponse: HttpResponse = {
          statusCode: 200,
          body: {
            name: 'André'
          }
        }

        return await new Promise(resolve => resolve(httpResponse))
      }
    }

    const controllerStub = new ControllerStub()

    const handleSpy = jest.spyOn(controllerStub, 'handle')
    const logControlerDecorator = new LogControlerDecorator(controllerStub)

    const httpRequest = {
      body: {
        email: 'any_mail@mail.com',
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'

      }
    }

    await logControlerDecorator.handle(httpRequest)

    expect(handleSpy).toHaveBeenCalledWith(httpRequest)
  })
})
