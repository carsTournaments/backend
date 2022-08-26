import mongoose from 'mongoose';

export interface ReportI {
  _id?: string;
  userReporter: any;
  userReported: any;
  carReported: any;
  reason: string;
  state: boolean;
  created?: string;
  updated?: string;
}

export interface ReportMongoI extends mongoose.Document {
  _id: string;
  userReporter: any;
  userReported: any;
  carReported: any;
  reason: string;
  state: boolean;
  created?: string;
  updated?: string;
}
