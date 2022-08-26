import { BrandI } from '@brand';
import { CarI } from '@car';
import { ImageI } from '@image';
import { randFullName, randEmail } from '@ngneat/falso';
import { TournamentI } from '@tournament';
import { UserI } from '@user';

export const brands: BrandI[] = [
  {
    name: 'Seat',
    country: 'es',
    continent: 'Europa',
  },
  {
    name: 'Ford',
    country: 'eu',
    continent: 'America',
  },
];

export const cars: CarI[] = [
  {
    model: 'Perro',
    brand: '',
    driver: '',
    fuel: 'Diesel',
    traction: 'Trasera',
    cv: 100,
    cc: 2000,
    year: 2022,
    stock: true,
    info: '',
  },
  {
    model: 'Gato',
    brand: '',
    driver: '',
    fuel: 'Gasolina',
    traction: 'Trasera',
    cv: 100,
    cc: 2000,
    year: 2022,
    stock: true,
    info: '',
  },
];

export const images: ImageI[] = [
  {
    type: 'car',
    car: '',
    url: 'tururu',
  },
  {
    type: 'tournament',
    car: '',
    url: 'tururu',
  },
];

export const tournaments: TournamentI[] = [
  {
    name: 'Perro todo',
    maxParticipants: 32,
    requisites: [],
    startDate: '2025-10-10',
    endDate: '',
    status: 'Todo',
    durationDays: 5,
  },
  {
    name: 'Perro',
    maxParticipants: 32,
    requisites: [],
    startDate: '2025-10-10',
    endDate: '',
    status: 'InProgress',
    durationDays: 5,
  },
];

export const users: UserI[] = [
  {
    name: randFullName(),
    email: randEmail(),
    role: 'ADMIN',
    country: 'es',
  },
  {
    name: randFullName(),
    email: randEmail(),
    role: 'USER',
    country: 'es',
  },
];
