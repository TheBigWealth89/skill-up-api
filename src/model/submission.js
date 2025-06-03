
import mongoose from "mongoose";
const submissionSchema = new mongoose.Schema({
  assignment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assignment',
    required: true 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  files: [{
    url: String,
    name: String,
    type: String
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  grade: {
    points: Number,
    feedback: String,
    gradedAt: Date
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late'],
    default: 'submitted'
  }
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default  Submission