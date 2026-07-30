import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  aiCoverLetter: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  appliedAt: Date;
}

const ApplicationSchema: Schema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  aiCoverLetter: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
  appliedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IApplication>('Application', ApplicationSchema);
