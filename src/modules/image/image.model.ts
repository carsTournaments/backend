import { ImageI } from '@image';
import * as mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['brand', 'car', 'tournament', 'user'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    firstImage: {
      type: Boolean,
    },
    position: {
      type: Number,
    },
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

export const Image = mongoose.model<ImageI>('Image', schema);
