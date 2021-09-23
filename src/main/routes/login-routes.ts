/* eslint-disable */
import { Router } from 'express'
import { adapterRoute } from '@/main/adapters'
import { makeSignUpController } from '@/main/factories/controllers'
import { makeLoginController } from '@/main/factories/controllers'

export default (router: Router): void => {
  router.post('/signup', adapterRoute(makeSignUpController()))
  router.post('/login', adapterRoute(makeLoginController()))
}
