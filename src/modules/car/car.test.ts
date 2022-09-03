import { Car } from '@car';
import { clearDatabase, closeDatabase } from '../../db';
import { api, setMockCars } from '@testing/helpers/app.helper';
import { getAllFromCars } from '@testing/helpers/helpers';
import { bodyCarGetAll } from '@testing/mocks/body.mock';
import { cars } from '@testing/mocks/models.mock';
import supertest from 'supertest';

describe('Car', () => {
  let apiTest: supertest.SuperTest<supertest.Test>;
  beforeAll(async () => (apiTest = api));
  beforeEach(async () => await setMockCars());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  describe('Get all cars', () => {
    // TODO: Revisar, tiene pinta de ser por el aggregate ya que una consulta normal cars.find({}) devuelve 2 coches
    test('cars and pagination', async () => {
      const response = await apiTest.post('/cars/getAll').send(bodyCarGetAll);
      expect(response.status).toBe(200);
      //   expect(response.body.items).toHaveLength(cars.length);
    });

    xtest('cars and pagination', async () => {
      const { items } = await getAllFromCars();
      expect(items).toHaveLength(cars.length);
    });

    xtest('the first car model is Perro', async () => {
      const { models } = await getAllFromCars();
      expect(models).toContain('Perro');
    });
  });

  xdescribe('Get one car', () => {
    test('get a valid car', async () => {
      const carsDB = await Car.find({});
      console.log(carsDB.length);
      const id = carsDB[0]._id.toString();

      await apiTest
        .post('/cars/one')
        .send({ id, site: 'admin' })
        .expect(200)
        .expect('Content-type', /application\/json/);
    });
  });
});
