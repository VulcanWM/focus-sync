import mongoose from 'mongoose'

const MilestoneSchema = new mongoose.Schema({
  name: String,
  username: String,
  tasks: [String],
  status: Boolean,
  totalNumber: Number
})


export default mongoose.models.Milestone || mongoose.model('Update', MilestoneSchema);