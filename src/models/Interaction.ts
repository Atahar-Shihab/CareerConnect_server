import mongoose, { Schema, Document } from 'mongoose';

export interface IInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  type: 'viewed' | 'saved' | 'applied' | 'skipped';
  createdAt: Date;
}

const InteractionSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  type: { type: String, enum: ['viewed', 'saved', 'applied', 'skipped'], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IInteraction>('Interaction', InteractionSchema);
