import moment from 'moment';
import { RoundMongoI } from './round.interface';
import * as mongoose from 'mongoose';

const statusValid = {
  values: ['Todo', 'InProgress', 'Completed'],
  message: '{VALUE} no es un status permitido',
};

const schema = new mongoose.Schema(
  {
    name: { type: String },
    participants: { type: Number, default: 0 },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    startDate: { type: String, default: moment().format('YYYY-MM-DD') },
    endDate: { type: String, default: moment().format('YYYY-MM-DD') },
    status: { type: String, default: 'Todo', enum: statusValid },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: { createdAt: 'created', updatedAt: 'updated' },
    id: false,
  }
);

const data: mongoose.VirtualTypeOptions = [
  {
    ref: 'Pairing',
    localField: '_id',
    foreignField: 'round',
    justOne: false,
  },
  {
    ref: 'Vote',
    localField: '_id',
    foreignField: 'round',
    justOne: false,
  },
];
schema.virtual('pairings', data[0]);
schema.virtual('votes', data[1]);

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
  },
});

export const Round = mongoose.model<RoundMongoI>('Round', schema);
