import mongoose from 'mongoose'

const TopicSchema = new mongoose.Schema({
  name: String,
  username: String,
  tasks: [String],
  status: Boolean,
  totalTime: Number
})


export default mongoose.models.Topic || mongoose.model('Topic', TopicSchema);