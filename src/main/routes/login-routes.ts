/* eslint-disable */
import { Router } from 'express'
import { adapterRoute } from '../adapter/express/express-route-adapter'
import { makeSignUpController } from './../factories/controllers/signUp/signup-controller-factory'
import { makeLoginController } from './../factories/controllers/login/login-controller-factory'

export default (router: Router): void => {
  router.post('/signup', adapterRoute(makeSignUpController()))
  router.post('/login', adapterRoute(makeLoginController()))
}
