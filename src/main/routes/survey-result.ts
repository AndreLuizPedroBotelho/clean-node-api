/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { adapterRoute } from '@/main/adapter/express-route-adapter'
import { makeSaveSurveyResultController } from '@/main/factories/controllers/survey-result/save-survey-result/save-survey-result-controller-factory'
import { auth } from '@/main/middlewares/auth'

export default (router: Router): void => {
  router.put('/surveys/:surveyId/results', auth, adapterRoute(makeSaveSurveyResultController()))
}
