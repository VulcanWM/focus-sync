import mongoose from 'mongoose'

const UpdateSchema = new mongoose.Schema({
  _id: String,
  username: String,
  house: String,
  date: Date,
  rating: Number,
  tasks: Object,
  day: Number,
  created: Date
})


export default mongoose.models.Update || mongoose.model('Update', UpdateSchema);