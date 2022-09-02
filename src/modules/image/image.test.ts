import { Brand } from '@brand';
import { Car } from '@car';
import { api } from '@testing/helpers/app.helper';
import {
  getAllFromBrands,
  getAllFromCars,
  getAllFromUsers,
} from '@testing/helpers/helpers';
import { bodyGetAll } from '@testing/mocks/body.mock';
import { brands, cars, images, users } from '@testing/mocks/models.mock';
import { User } from '@user';
import { clearDatabase, closeDatabase } from '../../db';
import supertest from 'supertest';
import { Image } from './image.model';

describe('Image', () => {
  let apiTest: supertest.SuperTest<supertest.Test>;
  beforeAll(async () => (apiTest = api));
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());
  beforeEach(async () => {
    for (const user of users) {
      const item = new User(user);
      await item.save();
    }
    const { items: usersDB } = await getAllFromUsers();

    for (const brand of brands) {
      const item = new Brand(brand);
      await item.save();
    }

    const { items: brandsDB } = await getAllFromBrands();

    for (const car of cars) {
      car.brand = brandsDB[0]._id.toString();
      car.driver = usersDB[0]._id.toString();
      const item = new Car(car);
      await item.save();
    }

    const { items: carsDB } = await getAllFromCars();

    for (const image of images) {
      image.car = carsDB[0]?._id.toString() ?? null;
      const item = new Image(image);
      await item.save();
    }
  });

  describe('Get all images', () => {
    test('images and pagination', async () => {
      await apiTest
        .post('/images/getAll')
        .send(bodyGetAll)
        .expect(200)
        .expect('Content-type', /application\/json/);
    });
  });

});
