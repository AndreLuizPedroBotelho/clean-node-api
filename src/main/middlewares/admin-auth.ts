import { adapterMiddleware } from '@/main/adapter/express-middleware-adapter'
import { makeAuthMiddleware } from '@/main/factories/middlewares/auth-middleware-factory'

export const adminAuth = adapterMiddleware(makeAuthMiddleware('admin'))
