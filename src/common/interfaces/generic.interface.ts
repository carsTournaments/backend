import { PaginatorI } from '@interfaces';

export interface GetAllI<T> {
  items: T[];
  paginator: PaginatorI;
}

export interface NameValueI {
  name: string;
  value: string;
}
