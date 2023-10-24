import mongoose, {Schema} from 'mongoose'

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  goal: String,
  house: String,
  created: Date,
  banned: Schema.Types.Mixed,
  badges: [String],
  plan: String
})

export default mongoose.models.User || mongoose.model('User', UserSchema);