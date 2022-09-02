import { bodyGetAll, bodyGetAllUser } from './../../testing/mocks/body.mock';
import { api } from '@testing/helpers/app.helper';
import { clearDatabase, closeDatabase } from '../../db';
import supertest from 'supertest';

describe('Vote', () => {
  let apiTest: supertest.SuperTest<supertest.Test>;
  beforeAll(async () => (apiTest = api));
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  describe('getAll', () => {
    test('admin', async () => {
      await apiTest
        .post('/votes/getAll')
        .send(bodyGetAll)
        .expect(200)
        .expect('Content-type', /application\/json/);
    });

    test('app', async () => {
      await apiTest
        .post('/votes/getAll')
        .send(bodyGetAllUser)
        .expect(200)
        .expect('Content-type', /application\/json/);
    });
  });
});
