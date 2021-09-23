import { adapterMiddleware } from '@/main/adapters'
import { makeAuthMiddleware } from '@/main/factories/middlewares'

export const adminAuth = adapterMiddleware(makeAuthMiddleware('admin'))
