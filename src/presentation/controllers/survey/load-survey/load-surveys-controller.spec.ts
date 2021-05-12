import { throwError } from '@/domain/test'
import { ok, noContent, serverError } from '@/presentation/helpers/http/http-helper'

import { LoadSurveysController } from './load-surveys-controller'
import { LoadSurveys, SurveyModel } from './load-surveys-controller-protocols'
import MockDate from 'mockdate'

type LoadSurveyControllerTypes = {
  loadSurveysController: LoadSurveysController
  loadSurveysStub: LoadSurveys
}

const makeFakeSurveys = (): SurveyModel[] => ([
  {
    id: 'any_id',
    question: 'any_question',
    answers: [{
      image: 'any_image',
      answer: 'any_answer'
    }],
    date: new Date()
  },
  {
    id: 'other_id',
    question: 'other_question',
    answers: [{
      image: 'other_image',
      answer: 'other_answer'
    }],
    date: new Date()
  }])

const makeLoadSurveys = (): LoadSurveys => {
  class LoadSurveysStub implements LoadSurveys {
    async load (): Promise<SurveyModel[]> {
      return await new Promise(resolve => resolve(makeFakeSurveys()))
    }
  }

  return new LoadSurveysStub()
}

const makeLoadSurveysController = (): LoadSurveyControllerTypes => {
  const loadSurveysStub = makeLoadSurveys()
  const loadSurveysController = new LoadSurveysController(loadSurveysStub)

  return {
    loadSurveysController,
    loadSurveysStub
  }
}

describe('LoadSurveys Controller', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call LoadSurveys', async () => {
    const { loadSurveysController, loadSurveysStub } = makeLoadSurveysController()

    const loadSpy = jest.spyOn(loadSurveysStub, 'load')
    await loadSurveysController.handle({})

    expect(loadSpy).toHaveBeenCalled()
  })

  test('Should return 200 on success', async () => {
    const { loadSurveysController } = makeLoadSurveysController()

    const httpResponse = await loadSurveysController.handle({})

    expect(httpResponse).toEqual(ok(makeFakeSurveys()))
  })

  test('Should return 204 if LoadSurveys returns empty', async () => {
    const { loadSurveysController, loadSurveysStub } = makeLoadSurveysController()

    jest.spyOn(loadSurveysStub, 'load').mockReturnValueOnce(new Promise(resolve =>
      resolve([])
    ))

    const httpResponse = await loadSurveysController.handle({})

    expect(httpResponse).toEqual(noContent())
  })

  test('Should return 500 if LoadSurveys throws', async () => {
    const { loadSurveysController, loadSurveysStub } = makeLoadSurveysController()

    jest.spyOn(loadSurveysStub, 'load').mockImplementationOnce(throwError)

    const httpResponse = await loadSurveysController.handle({})
    expect(httpResponse).toEqual(serverError(new Error()))
  })
})
