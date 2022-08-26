import { OtaI } from './ota.interface';
import * as mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    platform: { type: String, required: true },
    version: { type: String, required: true },
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

export const Ota = mongoose.model<OtaI>('Ota', schema);
