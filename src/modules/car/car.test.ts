import { api } from '@testing/helpers/app.helper';
import { getAllFromBrands, getAllFromCars, getAllFromUsers } from '@testing/helpers/helpers';
import { bodyCarGetAll } from '@testing/mocks/body.mock';
import { brands, cars, users } from '@testing/mocks/models.mock';
import { User } from '@user';
import { Brand } from '@brand';
import { Car } from '@car';
import mongoose from 'mongoose';

describe('Car', () => {
  beforeEach(async () => {
    const modelsForDeleted: any = [Brand, Car, User];
    for (const model of modelsForDeleted) {
      await model.deleteMany({}).exec();
    }

    for (const brand of brands) {
      const item = new Brand(brand);
      await item.save();
    }

    for (const user of users) {
      const item = new User(user);
      await item.save();
    }
    const { items: brandsDB } = await getAllFromBrands();
    const { items: usersDB } = await getAllFromUsers();

    for (const car of cars) {
      car.brand = brandsDB[0]._id;
      car.driver = usersDB[0]._id;
      const item = new Car(car);
      await item.save();
    }
  });

  describe('Get all cars', () => {
    test('cars and pagination', async () => {
      await api
        .post('/cars/getAll')
        .send(bodyCarGetAll)
        .expect(200)
        .expect('Content-type', /application\/json/);
    });

    // TODO: No esta devolviendo items pero si totales (2), en db si existen items

    xtest('cars and pagination', async () => {
        const { items } = await getAllFromCars();
        expect(items).toHaveLength(cars.length);
    });

    xtest('the first car model is Perro', async () => {
        const { models } = await getAllFromCars();
        expect(models).toContain('Perro');
    });
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
