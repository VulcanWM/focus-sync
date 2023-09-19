import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  goal: String,
  updates: [String],
  following: [String],
  house: String
})

module.exports = mongoose.models.User || mongoose.model('User', UserSchema)