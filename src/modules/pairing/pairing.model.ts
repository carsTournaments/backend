import { PairingI } from '@pairing';
import * as mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
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
    car1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    car2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: { createdAt: 'created', updatedAt: 'updated' },
    id: false,
    versionKey: false,
  }
);

const data: mongoose.VirtualTypeOptions = {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'pairing',
  justOne: false,
};
schema.virtual('votes', data);

schema.on('findAll', function () {
  this.populate('votes');
});

export const Pairing = mongoose.model<PairingI>('Pairing', schema);
