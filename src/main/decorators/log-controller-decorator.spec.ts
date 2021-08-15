import { mockAccountModel } from '@/domain/test'
import { LogErrorRepository } from '@/data/protocols/db/log/log-error-repository'
import { ok, serverError } from '@/presentation/helpers/http/http-helper'
import { HttpRequest, HttpResponse, Controller } from '@/presentation/protocols'
import { LogControllerDecorator } from './log-controller-decorator'
import { mockLogErrorRepository } from '@/data/test'

type LogControllerDecoratorTypes = {
  controllerStub: Controller
  logControllerDecorator: LogControllerDecorator
  logErrorRepositoryStub: LogErrorRepository
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password',
    passwordConfirmation: 'any_password'
  }
})

const makeFakeServerError = (): HttpResponse => {
  const fakeError = new Error()
  fakeError.stack = 'any_stack'

  return serverError(fakeError)
}

const makeController = (): Controller => {
  class ControllerStub implements Controller {
    async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
      return await new Promise(resolve => resolve(ok(mockAccountModel())))
    }
  }

  return new ControllerStub()
}

const makeLogControllerDecorator = (): LogControllerDecoratorTypes => {
  const controllerStub = makeController()
  const logErrorRepositoryStub = mockLogErrorRepository()
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

    await logControllerDecorator.handle(makeFakeRequest())

    expect(handleSpy).toHaveBeenCalledWith(makeFakeRequest())
  })

  test('Should return the same result of the controller', async () => {
    const { logControllerDecorator } = makeLogControllerDecorator()
    const httpResponse = await logControllerDecorator.handle(makeFakeRequest())

    expect(httpResponse).toEqual(ok(mockAccountModel()))
  })

  test('Should call LogErroRepository with correct error if controller return a server error', async () => {
    const { logControllerDecorator, controllerStub, logErrorRepositoryStub } = makeLogControllerDecorator()

    jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeServerError())))

    const logSpy = jest.spyOn(logErrorRepositoryStub, 'logError')

    await logControllerDecorator.handle(makeFakeRequest())

    expect(logSpy).toHaveBeenLastCalledWith('any_stack')
  })
})
