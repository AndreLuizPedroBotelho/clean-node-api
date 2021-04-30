/* eslint-disable */
import { Router } from 'express'
import { adapterRoute } from '@/main/adapter/express-route-adapter'
import { makeSignUpController } from '@/main/factories/controllers/login/signUp/signup-controller-factory'
import { makeLoginController } from '@/main/factories/controllers/login/login/login-controller-factory'

export default (router: Router): void => {
  router.post('/signup', adapterRoute(makeSignUpController()))
  router.post('/login', adapterRoute(makeLoginController()))
}
