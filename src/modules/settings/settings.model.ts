import * as mongoose from 'mongoose';
import { SettingsI } from './settings.interface';

const schema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    android: {
      version: {
        latestVersion: { type: String, default: '' },
        minVersion: { type: String, default: '' },
      },
      urlMarket: { type: String, default: '' },
    },
    ios: {
      version: {
        latestVersion: { type: String, default: '' },
        minVersion: { type: String, default: '' },
      },
      urlMarket: { type: String, default: '' },
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

export const Settings = mongoose.model<SettingsI>('Settings', schema);
