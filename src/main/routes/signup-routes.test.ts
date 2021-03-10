import request from 'supertest'
import app from '../config/app'

describe('SignUp Routes', () => {
  test('Should return default content type as json', async () => {
    await request(app)
      .post('/api/signup')
      .send({
        name: 'André',
        email: 'andre@hotmail.com',
        password: '123',
        passwordConfirmation: '123'
      })
      .expect(200)
  })
})
