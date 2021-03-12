import { HttpRequest, HttpResponse, Controller } from '../../presentation/protocols'
import { LogControllerDecorator } from './log'

interface LogControllerDecoratorTypes{
  controllerStub: Controller
  logControllerDecorator: LogControllerDecorator
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

const makeLogControllerDecorator = (): LogControllerDecoratorTypes => {
  const controllerStub = makeController()
  const logControllerDecorator = new LogControllerDecorator(controllerStub)

  return {
    controllerStub,
    logControllerDecorator
  }
}
describe('LogController Decorator', () => {
  test('Should call controller handle', async () => {
    const { controllerStub, logControllerDecorator } = makeLogControllerDecorator()
    const handleSpy = jest.spyOn(controllerStub, 'handle')

    const httpRequest = {
      body: {
        email: 'any_mail@mail.com',
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'

      }
    }

    await logControllerDecorator.handle(httpRequest)

    expect(handleSpy).toHaveBeenCalledWith(httpRequest)
  })

  test('Should return the same result of the controller', async () => {
    const { logControllerDecorator } = makeLogControllerDecorator()

    const httpRequest = {
      body: {
        email: 'any_mail@mail.com',
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'

      }
    }

    const httpResponse = await logControllerDecorator.handle(httpRequest)

    expect(httpResponse).toEqual({
      statusCode: 200,
      body: {
        name: 'André'
      }
    })
  })
})
