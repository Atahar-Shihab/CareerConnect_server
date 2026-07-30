import mongoose, { Schema, Document } from 'mongoose';

export interface IJobPosting extends Document {
  employerId: mongoose.Types.ObjectId;
  title: string;
  companyName: string;
  location: string;
  description: string;
  requirements: string[];
  type: 'full-time' | 'part-time' | 'internship';
  createdAt: Date;
}

const JobPostingSchema: Schema = new Schema({
  employerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  companyName: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: [String], default: [] },
  type: { type: String, enum: ['full-time', 'part-time', 'internship'], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IJobPosting>('JobPosting', JobPostingSchema);
