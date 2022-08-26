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
import mongoose from 'mongoose';
import { Image } from './image.model';

xdescribe('Image', () => {
  beforeEach(async () => {
    const modelsForDeleted: any = [Image, Car, Brand, User];
    for (const model of modelsForDeleted) {
      await model.deleteMany({}).exec();
    }

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
      await api
        .post('/images/getAll')
        .send(bodyGetAll)
        .expect(200)
        .expect('Content-type', /application\/json/);
    });
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
