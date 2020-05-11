const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
})

describe('when there is initially some notes saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(2)
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const saltRounds = 10
    const password = 'B.L.U.E.D.E.M.O.N.R.O.C.K.S.'
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const user = new User({
      username: 'bdemon',
      name: 'Blue Demon',
      passwordHash,
    })
    const savedUser = await user.save()
    const newBlog = helper.initialBlogs[2]
    newBlog.user = savedUser._id
    const userForToken = {
      username: savedUser.username,
      id: savedUser._id,
    }
    const token = jwt.sign(userForToken, process.env.SECRET)
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(3)

    const title = blogsAtEnd.map(b => b.title)
    expect(title).toContain(newBlog.title)
  })
  test('fails without token', async () => {
    const newBlog = helper.initialBlogs[2]
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})
describe('update of an existing blog', () => {
  test('succeeds with valid data', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    blogToUpdate.likes++

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(2)
    expect(blogsAtEnd[0].likes).toBe(blogToUpdate.likes)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with valid data', async () => {
    const saltRounds = 10
    const password = 'B.L.U.E.D.E.M.O.N.R.O.C.K.S.'
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const user = new User({
      username: 'bdemon',
      name: 'Blue Demon',
      passwordHash,
    })
    const savedUser = await user.save()
    const blog = helper.initialBlogs[2]
    const blogToDelete = new Blog({
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes === undefined ? 0 : blog.likes,
      user: savedUser._id
    })
    await blogToDelete.save()
    const blogsAtStart = await helper.blogsInDb()

    const userForToken = {
      username: savedUser.username,
      id: savedUser._id,
    }
    const token = jwt.sign(userForToken, process.env.SECRET)
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(
      blogsAtStart.length - 1
    )
    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
})

afterAll(() => {
  mongoose.connection.close()
})