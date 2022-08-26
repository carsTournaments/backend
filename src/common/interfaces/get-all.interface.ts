import { PaginatorI } from '@interfaces';

export interface GetAllI<T> {
  items: T[];
  paginator: PaginatorI;
}
