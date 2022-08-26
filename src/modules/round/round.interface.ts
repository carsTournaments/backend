import mongoose from 'mongoose';
import { PairingI } from '@pairing';
import { VoteI } from '@vote';

export interface RoundI {
  _id?: string;
  name: string;
  participants: number;
  tournament: any; // TournamentI
  startDate: string;
  endDate: string;
  status: string;
  pairings?: PairingI[]; // Virtual
  votes?: VoteI[];
}

export interface RoundMongoI extends mongoose.Document {
  _id?: string;
  name: string;
  participants: number;
  tournament: any; // TournamentI
  startDate: string;
  endDate: string;
  status: string;
  pairings?: PairingI[]; // Virtual
  votes?: VoteI[];
}
