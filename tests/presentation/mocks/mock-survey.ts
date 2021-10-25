import { AddSurvey, LoadSurveys, CheckSurveyById, LoadAnswersBySurvey } from '@/domain/usecases'
import { mockSurveyModels } from '@/tests/domain/mocks'
import { SurveyModel } from '@/domain/models'

export const mockAddSurvey = (): AddSurvey => {
  class AddSurveyStub implements AddSurvey {
    async add(data: AddSurvey.Params): Promise<void> {
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

export const mockLoadAnswersBySurvey = (): LoadAnswersBySurvey => {
  class LoadAnswersBySurveyStub implements LoadAnswersBySurvey {
    async loadAnswers(id: string): Promise<LoadAnswersBySurvey.Result> {
      return await Promise.resolve(['any_answer'])
    }
  }

  return new LoadAnswersBySurveyStub()
}

export const mockCheckSurveyById = (): CheckSurveyById => {
  class CheckSurveyByIdStub implements CheckSurveyById {
    async checkById(id: string): Promise<CheckSurveyById.Result> {
      return await Promise.resolve(true)
    }
  }

  return new CheckSurveyByIdStub()
}
