import { CarI } from './../car/car.interface';

export interface LikeGetAllReceivedForUserResponse {
  car: CarI;
  likes: number;
  lastLike: string;
}
