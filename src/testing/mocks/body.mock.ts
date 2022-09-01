import { CarGetAllDto } from '@car';
import { GetAllDto } from '@dtos';

export const bodyGetAll: GetAllDto = {
  page: 1,
  pageSize: 20,
  site: 'admin',
  order: ['created', 'asc'],
};

export const bodyCarGetAll: CarGetAllDto = {
  page: 1,
  pageSize: 20,
  site: 'user',
  order: ['created', 'asc'],
};
