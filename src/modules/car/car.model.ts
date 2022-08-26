import * as mongoose from 'mongoose';
import { CarI } from '.';

const tractionsValid = {
  values: ['FWD', 'RWD', 'AWD', '4WD', '4X4'],
  message: '{VALUE} no es un tipo de traccion permitido',
};

const fuelsValid = {
  values: ['gasoline', 'diesel', 'electric', 'hybrid'],
  message: '{VALUE} no es un tipo de combustible permitido',
};

const schema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    model: { type: String, default: '' },
    traction: { type: String, enum: tractionsValid, default: 'FWD' },
    fuel: { type: String, enum: fuelsValid, default: 'gasoline' },
    cc: { type: Number, default: 0 },
    cv: { type: Number, default: 0 },
    year: { type: Number, default: 0 },
    stock: { type: Boolean, default: true },
    info: { type: String, required: false },
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
    ref: 'Inscription',
    localField: '_id',
    foreignField: 'car',
    justOne: false,
  },
  {
    ref: 'Image',
    localField: '_id',
    foreignField: 'car',
    justOne: false,
  },
  {
    ref: 'Like',
    localField: '_id',
    foreignField: 'car',
    justOne: false,
  },
];
schema.virtual('inscriptions', data[0]);
schema.virtual('images', data[1]);
schema.virtual('likes', data[2]);

schema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
  },
});

export const Car = mongoose.model<CarI>('Car', schema);
