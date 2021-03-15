/* eslint-disable */
import { Router } from 'express'
import { adapterRoute } from '../adapter/express-route-adapter'
import { makeSignUpController } from '../factories/signUp/signup-factory'

export default (router: Router): void => {
  router.post('/signup', adapterRoute(makeSignUpController()))
}
