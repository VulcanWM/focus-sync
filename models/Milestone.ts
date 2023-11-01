import mongoose from 'mongoose'

const MilestoneSchema = new mongoose.Schema({
  name: String,
  username: String,
  tasks: [String],
  status: Boolean,
  totalTime: Number
})


export default mongoose.models.Milestone || mongoose.model('Milestone', MilestoneSchema);