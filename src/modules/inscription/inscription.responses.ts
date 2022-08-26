import { CarI } from '../car/car.interface';

export interface InscriptionGetMyCarsUserForInscriptionResponse {
  inscribed: CarI[];
  availables: CarI[];
  unavailable: CarI[];
}
