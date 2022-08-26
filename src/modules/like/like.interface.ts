import mongoose from 'mongoose';

export interface LikeI {
  _id?: string;
  car: any;
  user?: any;
  created?: string;
  updated?: string;
}

export interface LikeMongoI extends mongoose.Document {
  _id: string;
  car: any;
  user?: any;
  created?: string;
  updated?: string;
}
