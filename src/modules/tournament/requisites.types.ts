import { TournamentRequisiteI } from './tournament.interface';
export const requisitesDefault: TournamentRequisiteI[] = [
  {
    name: 'Coches Europeos',
    field: 'continent',
    operator: '=',
    value: 'Europa',
  },
  {
    name: 'Coches Americanos',
    field: 'continent',
    operator: '=',
    value: 'America',
  },
  {
    name: 'Coches Asiáticos',
    field: 'continent',
    operator: '=',
    value: 'Asia',
  },
  {
    name: 'Menos de 100CV',
    field: 'cv',
    operator: '<',
    value: 100,
  },
  {
    name: 'Menos de 200CV',
    field: 'cv',
    operator: '<',
    value: 100,
  },
  {
    name: 'Más de 100CV',
    field: 'cv',
    operator: '>',
    value: 100,
  },
  {
    name: 'Más de 200CV',
    field: 'cv',
    operator: '>',
    value: 200,
  },
];
