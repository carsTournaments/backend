import * as mongoose from 'mongoose';

export interface LiteralI {
  _id?: string;
  name: string;
  category: string;
  es: string;
  en: string;
  created?: string;
  updated?: string;
}

export interface LiteralMongoI extends mongoose.Document {
  name: string;
  category: string;
  es: string;
  en: string;
  created?: string;
  updated?: string;
}
