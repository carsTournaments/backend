import * as mongoose from 'mongoose';
import moment from 'moment';
import { TournamentMongoI } from '@tournament';

const statusValid = {
  values: ['Todo', 'InProgress', 'Completed', 'Cancelled'],
  message: '{VALUE} no es un status permitido',
};

const schema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    maxParticipants: { type: Number, default: 0 },
    requisites: { type: Array, default: [] },
    startDate: { type: String, default: moment().format('YYYY-MM-DD') },
    endDate: { type: String, default: null },
    durationDays: { type: Number, default: 0 },
    status: { type: String, default: 'Todo', enum: statusValid },
    info: { type: String, default: '' },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: { createdAt: 'created', updatedAt: 'updated' },
    id: false,
  }
);

const data: mongoose.VirtualTypeOptions[] = [
  {
    ref: 'Round',
    localField: '_id',
    foreignField: 'tournament',
    justOne: false,
  },
  {
    ref: 'Inscription',
    localField: '_id',
    foreignField: 'tournament',
    justOne: false,
  },
  {
    ref: 'Image',
    localField: '_id',
    foreignField: 'tournament',
    justOne: true,
  },
  {
    ref: 'Vote',
    localField: '_id',
    foreignField: 'tournament',
    justOne: false,
  },
  {
    ref: 'Winner',
    localField: '_id',
    foreignField: 'tournament',
    justOne: true,
  },
];

schema.virtual('rounds', data[0]);
schema.virtual('inscriptions', data[1]);
schema.virtual('image', data[2]);
schema.virtual('votes', data[3]);
schema.virtual('winners', data[4]);

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
  },
});

export const Tournament = mongoose.model<TournamentMongoI>(
  'Tournament',
  schema
);
