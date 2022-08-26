import { CarI } from '../car/car.interface';

export interface BrandI {
  _id?: string;
  name: string;
  country: string;
  continent: string;
  image?: any;
  cars?: CarI[]; // Virtual
}
