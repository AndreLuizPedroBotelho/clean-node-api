import { badRequest, serverError, unauthorized, notFound } from './components'
import { accountSchema, loginParamsSchema, errorSchema } from './schemas'
import { loginPath } from './paths/login-path'

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
    }
  ],
  paths: {
    '/login': loginPath
  },
  schemas: {
    account: accountSchema,
    loginParams: loginParamsSchema,
    error: errorSchema
  },
  components: {
    badRequest,
    serverError,
    unauthorized,
    notFound
  }
}
