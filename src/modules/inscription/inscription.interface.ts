import { CarI } from '../car/car.interface';
import { TournamentI } from '../tournament/tournament.interface';

export interface InscriptionI {
  _id?: string;
  car: any; // CarI
  tournament: any; // TournamentI
  driver: any; // UserI
}

export interface InscriptionGetAllForDriverI {
  todo: { tournament: TournamentI; cars: CarI[] }[];
  inProgress: { tournament: TournamentI; cars: CarI[] }[];
  completed: { tournament: TournamentI; cars: CarI[] }[];
}
