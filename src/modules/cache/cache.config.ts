import { CacheI } from '@interfaces';

export const CacheRoutes: CacheI[] = [
  {
    category: 'brand',
    name: 'allOfAllBrandsAndCarsBrand',
    value: 'brand.allOfAllBrandsAndCarsBrand',
    data: [
      {
        type: 'body',
        key: 'page',
      },
      {
        type: 'body',
        key: 'onlyWithPhoto',
      },
    ],
    expiration: 60 * 60,
  },
  {
    category: 'literal',
    name: 'getAllForLanguage',
    value: 'literal_allUser',
    data: [
      {
        type: 'params',
        key: 'language',
      },
    ],
    expiration: 60 * 60 * 24,
  },
  {
    category: 'settings',
    name: 'getSettingsForApp',
    value: 'settings_app',
    expiration: 60 * 60 * 24,
  },
  {
    category: 'toggle',
    name: 'getAll',
    value: 'toggle_all',
    data: [
      {
        type: 'body',
        key: 'site',
      },
    ],
    expiration: 60 * 60 * 24,
  },
  {
    category: 'tournament',
    name: 'getDaysForCalendar',
    value: 'tournament_getDaysForCalendar',
    expiration: 60 * 60,
  },
  {
    category: 'tournament',
    name: 'getCalendarItems',
    data: [
      {
        type: 'body',
        key: 'date',
      },
    ],
    value: 'tournament_getCalendarItems',
    expiration: 60 * 60,
  },
  {
    category: 'tournament',
    name: 'getAllOfAllStates',
    value: 'tournament_allOfAllStates',
    expiration: 60 * 60,
  },
  {
    category: 'user',
    name: 'getOne',
    value: 'user_getOne',
    data: [
      {
        type: 'body',
        key: 'id',
      },
    ],
    expiration: 60 * 60,
  },
  {
    category: 'user',
    name: 'getResume',
    value: 'user_getResume',
    data: [
      {
        type: 'token',
        key: '_id',
      },
    ],
    expiration: 30,
  },
];
