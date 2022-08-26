import * as mongoose from 'mongoose';
import { LiteralMongoI } from '@literal';

const schema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    category: { type: String, default: '' },
    es: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: { createdAt: 'created', updatedAt: 'updated' },
    id: false,
  }
);

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
  },
});

export const Literal = mongoose.model<LiteralMongoI>('Literal', schema);
