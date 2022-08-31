import { TournamentI } from '@tournament';
import { bodyGetAll } from '../mocks/body.mock';
import { UserI } from '@user';
import { api } from './app.helper';
import { BrandI } from '@brand';
import { CarI } from '@car';

export const getAllFromBrands = async (): Promise<{
  items: BrandI[];
  names: string[];
}> => {
  const response = await api.post('/brands/getAll').send(bodyGetAll);
  const names = response.body.items.map((item: BrandI) => item.name);
  return { items: response.body.items, names };
};

export const getAllFromCars = async (): Promise<{
  items: CarI[];
  models: string[];
}> => {
  const response = await api.post('/cars/getAll').send(bodyGetAll);
  const models = response.body.items.map((item: CarI) => item.model);
  return { items: response.body.items, models };
};

export const getAllFromTournaments = async (): Promise<{
  items: TournamentI[];
  status: string[];
}> => {
  const response = await api.post('/tournaments/getAll').send(bodyGetAll);
  const status = response.body.items.map((item: TournamentI) => item.status);
  return { items: response.body.items, status };
};

// Deprecar?
export const getAllFromUsers = async (): Promise<{
  items: UserI[];
  roles: string[];
}> => {
  const response = await api.post('/users/getAll').send(bodyGetAll);
  const roles = response.body.items.map((item: UserI) => item.role);
  return { items: response.body.items, roles };
};
