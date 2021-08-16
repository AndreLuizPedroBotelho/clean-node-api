import { AddSurvey, AddSurveyParams } from '@/domain/usecases/survey/add-survey'
import { mockSurveyModels } from '@/domain/test/mock-survey'
import { LoadSurveys } from '@/domain/usecases/survey/load-surveys'
import { mockSurveyLoadModel } from '@/domain/test'
import { LoadSurveyById } from '@/domain/usecases/survey/load-survey-by-id'
import { SurveyModel } from '@/domain/models/survey'

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
    async load(): Promise<SurveyModel[]> {
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
