import { HttpRequest, HttpResponse, Controller } from '../../presentation/protocols'
import { LogControlerDecorator } from './log'

interface LogControlerDecoratorTypes{
  controllerStub: Controller
  logControlerDecorator: LogControlerDecorator
}

const makeController = (): Controller => {
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

  return new ControllerStub()
}

const makeLogControlerDecorator = (): LogControlerDecoratorTypes => {
  const controllerStub = makeController()
  const logControlerDecorator = new LogControlerDecorator(controllerStub)

  return {
    controllerStub,
    logControlerDecorator
  }
}
describe('LogController Decorator', () => {
  test('Should call controller hamdle', async () => {
    const { controllerStub, logControlerDecorator } = makeLogControlerDecorator()
    const handleSpy = jest.spyOn(controllerStub, 'handle')

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
