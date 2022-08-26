import { CarI } from '@car';
import { WinnerGetAllCarWinnerI } from '@winner';

export interface WinnerGetOfTournamentCompleteResponse {
  gold: {
    car: CarI;
    votes: number;
  };
  silver: {
    car: CarI;
    votes: number;
  };
  bronze: {
    car: CarI;
    votes: number;
  };
}

export interface WinnerGetAllUserWinnersResponse {
  car: CarI;
  gold: WinnerGetAllCarWinnerI[];
  silver: WinnerGetAllCarWinnerI[];
  bronze: WinnerGetAllCarWinnerI[];
}
