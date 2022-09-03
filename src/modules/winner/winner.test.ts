import { bodyGetAll } from '../../testing/mocks/body.mock';
import { api } from '@testing/helpers/app.helper';
import { clearDatabase, closeDatabase } from '../../db';
import supertest from 'supertest';

describe('Winner', () => {
  let apiTest: supertest.SuperTest<supertest.Test>;
  beforeAll(async () => (apiTest = api));
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  describe('getAll', () => {
    test('admin', async () => {
      await apiTest
        .post('/winners/getAll')
        .send(bodyGetAll)
        .expect(200)
        .expect('Content-type', /application\/json/);
    });
  });
});
