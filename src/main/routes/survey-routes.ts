import { makeAuthMiddleware } from './../factories/middlewares/auth-middleware-factory'
/* eslint-disable */
import { Router } from 'express'
import { adapterRoute } from '../adapter/express-route-adapter'
import { adapterMiddleware } from './../adapter/express-middleware-adapter'

import { makeAddSurveyController } from './../factories/controllers/survey/add-survey/add-survey-controller-factory'

export default (router: Router): void => {
  const adminAuth = adapterMiddleware(makeAuthMiddleware('admin'))
  
  router.post('/surveys',adminAuth, adapterRoute(makeAddSurveyController()))
}
