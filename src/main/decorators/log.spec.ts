import { LogErrorRepository } from '../../data/protocols/log-error-repository'
import { serverError } from '../../presentation/helpers/http-helper'
import { HttpRequest, HttpResponse, Controller } from '../../presentation/protocols'
import { LogControllerDecorator } from './log'

interface LogControllerDecoratorTypes{
  controllerStub: Controller
  logControllerDecorator: LogControllerDecorator
  logErrorRepositoryStub: LogErrorRepository
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

const makeLogErrorRepository = (): LogErrorRepository => {
  class LogErrorRepositoryStub implements LogErrorRepository {
    async log (stack: string): Promise<void> {
      return await new Promise(resolve => resolve())
    }
  }

  return new LogErrorRepositoryStub()
}

const makeLogControllerDecorator = (): LogControllerDecoratorTypes => {
  const controllerStub = makeController()
  const logErrorRepositoryStub = makeLogErrorRepository()
  const logControllerDecorator = new LogControllerDecorator(controllerStub, logErrorRepositoryStub)

  return {
    controllerStub,
    logControllerDecorator,
    logErrorRepositoryStub
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

  test('Should call LogErroRepository with correct error if controller return a server error', async () => {
    const { logControllerDecorator, controllerStub, logErrorRepositoryStub } = makeLogControllerDecorator()

    const fakeError = new Error()
    fakeError.stack = 'any_stack'

    const error = serverError(fakeError)
    jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(new Promise(resolve => resolve(error)))

    const logSpy = jest.spyOn(logErrorRepositoryStub, 'log')

    const httpRequest = {
      body: {
        email: 'any_mail@mail.com',
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'

      }
    }

    await logControllerDecorator.handle(httpRequest)

    expect(logSpy).toHaveBeenLastCalledWith('any_stack')
  })
})
