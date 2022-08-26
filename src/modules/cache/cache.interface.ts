export interface CacheI {
  category: string;
  name: string;
  value: string;
  data?: CacheDataI[];
  expiration?: number;
}

export interface CacheDataI {
  type?: 'body' | 'params' | 'token';
  key?: string;
}

export interface CacheGetAllI {
  name: string;
  size: string;
  expiration: string;
}
