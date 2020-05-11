const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
})

describe('when creating a new user', () => {
  /*
  test('succeedes with valid data', async () => {
    const newUser = { username: 'Bob', password: 'yo123' }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  })
  */
  test('should provide username and password otherwise the response is 400 bad request', async () => {
    const newUser = { username: 'Bob' }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400, {
        error: 'content missing' })
  })
  test('should provide password with at least 3 characters long', async () => {
    const newUser = { username: 'Bob', password: 'yo' }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400, {
        error: 'password must be at least 3 characters long' })
  })
})

afterAll(() => {
  mongoose.connection.close()
})