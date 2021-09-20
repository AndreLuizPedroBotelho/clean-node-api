import { adapterMiddleware } from '@/main/adapter'
import { makeAuthMiddleware } from '@/main/factories/middlewares'

export const adminAuth = adapterMiddleware(makeAuthMiddleware('admin'))
