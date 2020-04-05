const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => (sum + blog.likes), 0)
}

const favoriteBlog = (blogs) => {
  return blogs.map((blog) => ({ title: blog.title, author: blog.author, likes: blog.likes }))
    .reduce((fav, blog) => {
      return fav.likes >= blog.likes ? fav : blog
    })
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}