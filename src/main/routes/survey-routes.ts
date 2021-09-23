import { adminAuth, auth } from '@/main/middlewares'
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { adapterRoute } from '@/main/adapters'

import { makeAddSurveyController, makeLoadSurveysController } from '@/main/factories/controllers'

export default (router: Router): void => {
  router.post('/surveys', adminAuth, adapterRoute(makeAddSurveyController()))
  router.get('/surveys', auth, adapterRoute(makeLoadSurveysController()))
}
