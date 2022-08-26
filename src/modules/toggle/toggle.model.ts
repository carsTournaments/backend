import * as mongoose from 'mongoose';
import { ToggleI } from '@toggle';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    state: { type: Boolean, required: true },
    description: { type: String, required: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: { createdAt: 'created', updatedAt: 'updated' },
    id: false,
    strict: false,
  }
);

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
  },
});

export const Toggle = mongoose.model<ToggleI>('Toggle', schema);
