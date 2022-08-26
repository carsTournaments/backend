import * as mongoose from 'mongoose';
import { VoteI } from '@vote';

const schema = new mongoose.Schema(
  {
    pairing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pairing',
      required: true,
    },
    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Round',
      required: true,
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    uuid: {
      type: String,
      required: false,
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

export const Vote = mongoose.model<VoteI>('Vote', schema);
