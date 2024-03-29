import { AddSurvey } from '@/domain/usecases'
import { SurveyModel } from '@/domain/models'

export const mockSurveyParams = (): AddSurvey.Params => ({
  question: 'any_question',
  answers: [{
    answer: 'any_answer',
    image: 'any_image'
  },
  {
    answer: 'other_answer'
  }],
  date: new Date()
})

export const mockSurveyModel = (): SurveyModel => ({
  id: 'any_survey_id',
  ...mockSurveyParams()
})

export const mockSurveyLoadModel = (): SurveyModel => ({
  id: 'any_survey_id',
  ...mockSurveyParams()
})

export const mockSurveyModels = (): SurveyModel[] => ([
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
