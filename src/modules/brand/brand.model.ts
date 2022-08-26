import * as mongoose from 'mongoose';
import { BrandI } from './brand.interface';

const schema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    country: { type: String, required: true },
    continent: { type: String, required: true },
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

const data: mongoose.VirtualTypeOptions[] = [
  {
    ref: 'Car',
    localField: '_id',
    foreignField: 'brand',
    justOne: false,
  },
  {
    ref: 'Image',
    localField: '_id',
    foreignField: 'brand',
    justOne: true,
  },
];
schema.virtual('cars', data[0]);
schema.virtual('image', data[1]);

export const Brand = mongoose.model<BrandI>('Brand', schema);
