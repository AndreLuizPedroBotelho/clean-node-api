/* eslint-disable */
import { Router } from 'express'
import { adapterRoute } from '../adapter/express/express-route-adapter'
import { makeSignUpController } from '../factories/signUp/signup-factory'
import { makeLoginController } from './../factories/login/login-factory'

export default (router: Router): void => {
  router.post('/signup', adapterRoute(makeSignUpController()))
  router.post('/login', adapterRoute(makeLoginController()))
}
