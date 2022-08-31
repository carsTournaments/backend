/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageReporters: ['json', 'lcov', 'text'],
  moduleNameMapper: {
    '@core/(.*)': '<rootDir>/src/core/$1',
    '@exceptions/(.*)': '<rootDir>/src/core/exceptions/$1',
    '@exceptions': '<rootDir>/src/core/exceptions',
    '@services/(.*)': '<rootDir>/src/core/services/$1',
    '@services': '<rootDir>/src/core/services',
    // Modulos
    '@analytics/(.*)': '<rootDir>/src/modules/analytics/$1',
    '@analytics': '<rootDir>/src/modules/analytics',
    '@auth/(.*)': '<rootDir>/src/modules/auth/$1',
    '@auth': '<rootDir>/src/modules/auth',
    '@brand/(.*)': '<rootDir>/src/modules/brand/$1',
    '@brand': '<rootDir>/src/modules/brand',
    '@cache/(.*)': '<rootDir>/src/modules/cache/$1',
    '@cache': '<rootDir>/src/modules/cache',
    '@car/(.*)': '<rootDir>/src/modules/car/$1',
    '@car': '<rootDir>/src/modules/car',
    '@default/(.*)': '<rootDir>/src/modules/default/$1',
    '@default': '<rootDir>/src/modules/default',
    '@crontab/(.*)': '<rootDir>/src/modules/crontab/$1',
    '@crontab': '<rootDir>/src/modules/crontab',
    '@image/(.*)': '<rootDir>/src/modules/image/$1',
    '@image': '<rootDir>/src/modules/image',
    '@inscription/(.*)': '<rootDir>/src/modules/inscription/$1',
    '@inscription': '<rootDir>/src/modules/inscription',
    '@like/(.*)': '<rootDir>/src/modules/like/$1',
    '@like': '<rootDir>/src/modules/like',
    '@literal/(.*)': '<rootDir>/src/modules/literal/$1',
    '@literal': '<rootDir>/src/modules/literal',
    '@logger/(.*)': '<rootDir>/src/modules/logger/$1',
    '@logger': '<rootDir>/src/modules/logger',
    '@menu/(.*)': '<rootDir>/src/modules/menu/$1',
    '@menu': '<rootDir>/src/modules/menu',
    '@ota/(.*)': '<rootDir>/src/modules/ota/$1',
    '@ota': '<rootDir>/src/modules/ota',
    '@pairing/(.*)': '<rootDir>/src/modules/pairing/$1',
    '@pairing': '<rootDir>/src/modules/pairing',
    '@notification/(.*)': '<rootDir>/src/modules/notification/$1',
    '@notification': '<rootDir>/src/modules/notification',
    '@report/(.*)': '<rootDir>/src/modules/report/$1',
    '@report': '<rootDir>/src/modules/report',
    '@round/(.*)': '<rootDir>/src/modules/round/$1',
    '@round': '<rootDir>/src/modules/round',
    '@search/(.*)': '<rootDir>/src/modules/search/$1',
    '@search': '<rootDir>/src/modules/search',
    '@services': '<rootDir>/src/core/services',
    '@settings/(.*)': '<rootDir>/src/modules/settings/$1',
    '@settings': '<rootDir>/src/modules/settings',
    '@stats/(.*)': '<rootDir>/src/modules/stats/$1',
    '@stats': '<rootDir>/src/modules/stats',
    '@toggle/(.*)': '<rootDir>/src/modules/toggle/$1',
    '@toggle': '<rootDir>/src/modules/toggle',
    '@tournament/(.*)': '<rootDir>/src/modules/tournament/$1',
    '@tournament': '<rootDir>/src/modules/tournament',
    '@user/(.*)': '<rootDir>/src/modules/user/$1',
    '@user': '<rootDir>/src/modules/user',
    '@vote/(.*)': '<rootDir>/src/modules/vote/$1',
    '@vote': '<rootDir>/src/modules/vote',
    '@winner/(.*)': '<rootDir>/src/modules/winner/$1',
    '@winner': '<rootDir>/src/modules/winner',
    // common
    '@aggregates/(.*)': '<rootDir>/src/common/aggregates/$1',
    '@aggregates': '<rootDir>/src/common/aggregates',
    '@dtos/(.*)': '<rootDir>/src/common/dtos/$1',
    '@dtos': '<rootDir>/src/common/dtos',
    '@middlewares/(.*)': '<rootDir>/src/common/middlewares/$1',
    '@middlewares': '<rootDir>/src/common/middlewares',
    '@testing/(.*)': '<rootDir>/src/testing/$1',
    '@testing': '<rootDir>/src/testing',
    '@test-mocks/(.*)': '<rootDir>/src/testing/mocks/$1',
    '@test-mocks': '<rootDir>/src/testing/mocks',
    '@test-helpers/(.*)': '<rootDir>/src/testing/helpers/$1',
    '@test-helpers': '<rootDir>/src/testing/helpers',
  },
};
