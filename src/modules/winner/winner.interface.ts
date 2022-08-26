import { CarI } from '@car';
import { TournamentI } from '@tournament';

export interface WinnerI {
  _id?: string;
  tournament: any;
  gold: any; // CarI;
  silver: any; // CarI;
  bronze: any; // CarI;
  created?: string;
}

export interface WinnerGetAllCarWinnerI {
  _id: string;
  tournament: TournamentI;
  winner: WinnerGetAllCarWinnerItemI;
}

export interface WinnerGetAllCarWinnerItemI {
  type: 'gold' | 'silver' | 'bronze';
  car: CarI;
}
