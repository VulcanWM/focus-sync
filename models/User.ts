import mongoose, {Schema} from 'mongoose'

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  goal: String,
  following: [String],
  house: String,
  created: Date,
  banned: Schema.Types.Mixed
})

export default mongoose.models.User || mongoose.model('User', UserSchema);