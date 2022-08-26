import mongoose from 'mongoose';
import { ImageI } from '@image';

export interface TournamentI {
  _id?: string;
  name: string;
  maxParticipants: number;
  requisites: TournamentRequisiteI[];
  startDate: string;
  endDate?: string;
  status: string;
  durationDays: number;
  info?: string;
  created?: string;
  updated?: string;
  image?: ImageI;
  rounds?: any; // Virtual
  inscriptions?: any; // Virtual
  votes?: any; // Virtual
  pairings?: any; // Virtual
  lastRound?: string;
}

export interface TournamentMongoI extends mongoose.Document {
  _id?: string;
  name: string;
  maxParticipants: number;
  requisites: TournamentRequisiteI[];
  startDate: string;
  endDate: string;
  status: string;
  durationDays: number;
  inscriptions?: any;
  created?: string;
  updated?: string;
}

export interface TournamentRequisiteI {
  name: string;
  field: string;
  operator: string;
  value: any;
}
