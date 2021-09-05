export const surveyResultAnswerSchema = {
  type: 'object',
  properties: {
    image: {
      type: 'string'
    },
    answer: {
      type: 'string'
    },
    count: {
      type: 'string'
    },
    percent: {
      type: 'string'
    }
  },
  required: ['answer', 'count', 'percent']
}
