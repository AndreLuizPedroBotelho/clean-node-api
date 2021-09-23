import { LogControllerDecorator } from '@/main/decorators'
import { mockAccountModel } from '@/tests/domain/mocks'
import { LogErrorRepository } from '@/data/protocols'
import { ok, serverError } from '@/presentation/helpers'
import { HttpResponse, Controller } from '@/presentation/protocols'
import { mockLogErrorRepository } from '@/tests/data/mocks'

type LogControllerDecoratorTypes = {
  controllerStub: Controller
  logControllerDecorator: LogControllerDecorator
  logErrorRepositoryStub: LogErrorRepository
}

const mockRequest = (): any => ({
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'any_password',
  passwordConfirmation: 'any_password'
})

const mockServerError = (): HttpResponse => {
  const fakeError = new Error()
  fakeError.stack = 'any_stack'

  return serverError(fakeError)
}

const makeController = (): Controller => {
  class ControllerStub implements Controller {
    async handle(request: any): Promise<HttpResponse> {
      return await Promise.resolve(ok(mockAccountModel()))
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

    await logControllerDecorator.handle(mockRequest())

    expect(handleSpy).toHaveBeenCalledWith(mockRequest())
  })

  test('Should return the same result of the controller', async () => {
    const { logControllerDecorator } = makeLogControllerDecorator()
    const httpResponse = await logControllerDecorator.handle(mockRequest())

    expect(httpResponse).toEqual(ok(mockAccountModel()))
  })

  test('Should call LogErroRepository with correct error if controller return a server error', async () => {
    const { logControllerDecorator, controllerStub, logErrorRepositoryStub } = makeLogControllerDecorator()

    jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(Promise.resolve(mockServerError()))

    const logSpy = jest.spyOn(logErrorRepositoryStub, 'logError')

    await logControllerDecorator.handle(mockRequest())

    expect(logSpy).toHaveBeenLastCalledWith('any_stack')
  })
})
