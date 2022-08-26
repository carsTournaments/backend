import { ImageI } from '@image';
import { InscriptionI } from '@inscription';
import { LikeI } from '@like';
import { PairingI } from '@pairing';
import { TournamentI } from '@tournament';
import { VoteI } from '@vote';
import { WinnerI } from '@winner';

export interface CarI {
  _id?: string;
  driver: any; // UserI
  brand: any; // BrandI
  model: string;
  fuel: string;
  traction: string;
  cv: number;
  cc: number;
  year: number;
  stock: boolean;
  info: string;
  images?: ImageI[]; // Virtual
  likes?: any; // Virtual
  liked?: boolean;
  pairings?: any;
  pairingsC1?: any;
  pairingsC2?: any;
  pairingsWinners?: any;
  tournaments?: TournamentI[]; // Virtual
  winners?: {
    gold: number;
    silver: number;
    bronze: number;
  };
}

export interface CarRankingI {
  _id: string;
  name: string;
  driver: string;
  images: ImageI[];
  // totals
  votes: number;
  pairings: number;
  pairingsWinners: number;
  tournamentsWinners: string;
  likes: number;
  inscriptions: number;
  state?: boolean;
  icon?: string;
}

export interface CarRankingItemsI {
  cars: CarI[];
  votes: VoteI[];
  pairings: PairingI[];
  winners: WinnerI[];
  likes: LikeI[];
  inscriptions: InscriptionI[];
}

export interface CarStatsI {
  name: string;
  label: string;
  items: CarStatsItemI[];
}

export interface CarStatsItemI {
  name: string;
  value: number;
}
