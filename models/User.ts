import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  goal: String,
  following: [String],
  house: String
})

export default mongoose.models.User || mongoose.model('User', UserSchema);