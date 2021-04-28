import { ok } from './../../../helpers/http/http-helper'
import { SurveyModel } from '../../../../domain/models/survey'
import { LoadSurveysController } from './load-surveys-controller'
import { LoadSurveys } from './load-surveys-controller-protocols'
import MockDate from 'mockdate'

interface LoadSurveyControllerTypes{
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
})
