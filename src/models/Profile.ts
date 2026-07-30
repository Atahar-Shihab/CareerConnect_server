import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  bio: string;
  skills: string[];
  education: string;
  experience: string;
  portfolioUrl?: string;
  resumeUrl?: string;
}

const ProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  education: { type: String, default: '' },
  experience: { type: String, default: '' },
  portfolioUrl: { type: String },
  resumeUrl: { type: String },
});

export default mongoose.model<IProfile>('Profile', ProfileSchema);
