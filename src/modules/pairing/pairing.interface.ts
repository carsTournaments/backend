import mongoose from 'mongoose';

export interface PairingI {
  _id?: string;
  round: any;
  tournament: any;
  winner: any;
  car1: any;
  car2: any;
  votes?: any;
  created?: string;
  updated?: string;
}

export interface PairingMongoI extends mongoose.Document {
  _id: string;
  round: string; //RoundI
  tournament: any;
  winner: any; // CarI
  car1: any;
  car2: any;
  votes?: any;
  created?: string;
  updated?: string;
}
