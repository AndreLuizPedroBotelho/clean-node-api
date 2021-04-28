/* eslint-disable @typescript-eslint/no-misused-promises */
import { makeAuthMiddleware } from './../factories/middlewares/auth-middleware-factory'
import { Router } from 'express'
import { adapterRoute } from '../adapter/express-route-adapter'
import { adapterMiddleware } from './../adapter/express-middleware-adapter'

import { makeAddSurveyController } from './../factories/controllers/survey/add-survey/add-survey-controller-factory'
import { makeLoadSurveysController } from './../factories/controllers/survey/load-surveys/load-surveys-controller.factory'

export default (router: Router): void => {
  const adminAuth = adapterMiddleware(makeAuthMiddleware('admin'))
  const auth = adapterMiddleware(makeAuthMiddleware())

  router.post('/surveys', adminAuth, adapterRoute(makeAddSurveyController()))
  router.get('/surveys', auth, adapterRoute(makeLoadSurveysController()))
}
