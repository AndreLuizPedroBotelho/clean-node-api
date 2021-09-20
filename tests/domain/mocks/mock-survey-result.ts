import { SaveSurveyResultParams } from '@/domain/usecases'
import { SurveyResultModel } from '@/domain/models'

export const mockSurveyResultParams = (): SaveSurveyResultParams => ({
  surveyId: 'any_survey_id',
  accountId: 'any_account_id',
  answer: 'any_answer',
  date: new Date()
})

export const mockSurveyResultEmptyAnswer = (): SurveyResultModel => ({
  surveyId: 'any_survey_id',
  question: 'any_question',
  answers: [{
    image: 'any_image',
    answer: 'any_answer',
    count: 0,
    percent: 0,
    isCurrentAccountAnswer: false
  },
  {
    answer: 'other_answer',
    count: 0,
    percent: 0,
    isCurrentAccountAnswer: false
  }],
  date: new Date()
})

export const mockSurveyResultModel = (): SurveyResultModel => ({
  surveyId: 'any_survey_id',
  question: 'any_question',
  answers: [{
    image: 'any_image',
    answer: 'any_answer',
    count: 1,
    percent: 50,
    isCurrentAccountAnswer: true
  },
  {
    answer: 'other_answer',
    count: 10,
    percent: 80,
    isCurrentAccountAnswer: false
  }],
  date: new Date()
})
