import {
  badRequest,
  serverError,
  unauthorized,
  notFound,
  forbidden
} from './components'

import {
  accountSchema,
  loginParamsSchema,
  surveyAnswerSchema,
  errorSchema,
  surveySchema,
  surveysSchema,
  apiKeyAuthSchema,
  signUpParamsSchema,
  addSurveyParamsSchema
} from './schemas'

import { loginPath, signUpPath, surveyPath } from './paths'

export default {
  openapi: '3.0.0',
  info: {
    title: 'Clean Node API',
    description: 'API para realizar enquetes entre programadores',
    version: '1.0.0'
  },
  license: {
    name: 'GPL_3.0-or-later',
    url: 'https://spdx.org/licenses/GPL-3.0-or-later.html'
  },
  servers: [{
    url: '/api'
  }],
  tags: [
    {
      name: 'Login'
    },
    {
      name: 'Enquete'
    }
  ],
  paths: {
    '/login': loginPath,
    '/surveys': surveyPath,
    '/signup': signUpPath
  },
  schemas: {
    account: accountSchema,
    loginParams: loginParamsSchema,
    signUpParams: signUpParamsSchema,
    survey: surveySchema,
    surveys: surveysSchema,
    surveyAnswer: surveyAnswerSchema,
    addSurveyParams: addSurveyParamsSchema,
    error: errorSchema
  },
  components: {
    securitySchemes: {
      apiKeyAuth: apiKeyAuthSchema
    },
    badRequest,
    serverError,
    unauthorized,
    notFound,
    forbidden
  }
}
