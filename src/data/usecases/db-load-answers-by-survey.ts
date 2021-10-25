import { LoadAnswersBySurvey } from '@/domain/usecases'
import { LoadAnswersBySurveyRepository } from '@/data/protocols'

export class DbLoadAnswersBySurvey implements LoadAnswersBySurvey {
  constructor(
    private readonly loadSurveyByIdRepository: LoadAnswersBySurveyRepository

  ) { }

  async loadAnswers(id: string): Promise<LoadAnswersBySurvey.Result> {
    return await this.loadSurveyByIdRepository.loadAnswers(id)
  }
}
