import { adapterMiddleware } from '../adapter/express-middleware-adapter'
import { makeAuthMiddleware } from '../factories/middlewares/auth-middleware-factory'

export const auth = adapterMiddleware(makeAuthMiddleware())
