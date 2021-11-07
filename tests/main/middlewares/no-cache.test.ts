import request from 'supertest'
import { setupApp } from '@/main/config/app'
import { noCache } from '@/main/middlewares'
import { Express } from 'express'

let app: Express

describe('NoCache Middleware', () => {
  beforeAll(async () => {
    app = await setupApp()
  })

  test('Should disabled cache', async () => {
    app.get('/test-no-cache', noCache, (req, res) => {
      res.send(req.body)
    })

    await request(app)
      .get('/test-no-cache')
      .expect('cache-control', 'no-store, no-cache, must-revalidate,proxy-revalidate')
      .expect('pragma', 'no-cache')
      .expect('expires', '0')
      .expect('surrogate-control', 'no-store')
  })
})
