import * as mongoose from 'mongoose';
import { NotificationMongoI } from '@notification';

const schema = new mongoose.Schema(
  {
    users: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    fcms: { type: [String], default: [] },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    link: { type: String, default: '' },
    opened: { type: Number, default: 0 },
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

export const Notification = mongoose.model<NotificationMongoI>(
  'Notification',
  schema
);
