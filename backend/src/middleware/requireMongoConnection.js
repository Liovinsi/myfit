import mongoose from 'mongoose'

export function requireMongoConnection(_req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'MongoDB is not connected' })
  }

  next()
}
