import { mockSurveyModel, mockSurveyModels } from '@/tests/domain/mocks'
import {
  LoadSurveyByIdRepository,
  LoadSurveysRepository,
  AddSurveyRepository,
  CheckSurveyByIdRepository,
  LoadAnswersBySurveyRepository
} from '@/data/protocols'
import { SurveyModel } from '@/domain/models'

export const mockAddSurveyRepository = (): AddSurveyRepository => {
  class AddSurveyRepositoryStub implements AddSurveyRepository {
    async add(account: AddSurveyRepository.Params): Promise<void> {
      return await Promise.resolve()
    }
  }

  return new AddSurveyRepositoryStub()
}

export const mockLoadSurveyByIdRepository = (): LoadSurveyByIdRepository => {
  class LoadSurveyByIdRepositoryStub implements LoadSurveyByIdRepository {
    async loadById(id: string): Promise<LoadSurveyByIdRepository.Result> {
      return await Promise.resolve(mockSurveyModel())
    }
  }

  return new LoadSurveyByIdRepositoryStub()
}

export const mockLoadAnswersBySurveyRepository = (): LoadAnswersBySurveyRepository => {
  class LoadAnswersBySurveyRepositoryStub implements LoadAnswersBySurveyRepository {
    async loadAnswers(id: string): Promise<LoadAnswersBySurveyRepository.Result> {
      return await Promise.resolve([mockSurveyModel().answers[0].answer, mockSurveyModel().answers[1].answer])
    }
  }

  return new LoadAnswersBySurveyRepositoryStub()
}

export const mockCheckSurveyByIdRepository = (): CheckSurveyByIdRepository => {
  class CheckSurveyByIdRepositoryStub implements CheckSurveyByIdRepository {
    async checkById(id: string): Promise<CheckSurveyByIdRepository.Result> {
      return await Promise.resolve(true)
    }
  }

  return new CheckSurveyByIdRepositoryStub()
}

export const mockLoadSurveysRepository = (): LoadSurveysRepository => {
  class LoadSurveysRepositoryStub implements LoadSurveysRepository {
    async loadAll(accountId: string): Promise<SurveyModel[]> {
      return await Promise.resolve(mockSurveyModels())
    }
  }

  return new LoadSurveysRepositoryStub()
}
