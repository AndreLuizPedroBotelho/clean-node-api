import { AddSurvey, AddSurveyParams, LoadSurveys, LoadSurveyById } from '@/domain/usecases'
import { mockSurveyModels, mockSurveyLoadModel } from '@/tests/domain/mocks'
import { SurveyModel } from '@/domain/models'

export const mockAddSurvey = (): AddSurvey => {
  class AddSurveyStub implements AddSurvey {
    async add(data: AddSurveyParams): Promise<void> {
      return await Promise.resolve()
    }
  }

  return new AddSurveyStub()
}

export const mockLoadSurveys = (): LoadSurveys => {
  class LoadSurveysStub implements LoadSurveys {
    async load(accountId: string): Promise<SurveyModel[]> {
      return await Promise.resolve(mockSurveyModels())
    }
  }

  return new LoadSurveysStub()
}

export const mockLoadSurveyById = (): LoadSurveyById => {
  class LoadSurveyByIdStub implements LoadSurveyById {
    async loadById(id: string): Promise<SurveyModel> {
      return await Promise.resolve(mockSurveyLoadModel())
    }
  }

  return new LoadSurveyByIdStub()
}
