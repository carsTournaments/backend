import supertest from 'supertest';
import { brands, users, cars } from '@testing/mocks/models.mock';
import { getAllFromBrands, getAllFromUsers } from './helpers';
import { User } from '@user';
import { Brand } from '@brand';
import { Car } from '@car';
import { Tournament } from '@tournament';
import app from '../../app';

export const setCars = (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      deleteAll();
      const { items: brandsDB } = await getAllFromBrands();
      const { items: usersDB } = await getAllFromUsers();
      if (brandsDB.length === 0) {
        for (const brand of brands) {
          const item = new Brand(brand);
          await item.save();
        }
      }

      if (usersDB.length === 0) {
        // crear usuario
        for (const user of users) {
          const item = new User(user);
          await item.save();
        }
      }

      const { items: brandsDB2 } = await getAllFromBrands();
      const { items: usersDB2 } = await getAllFromUsers();
      for (const car of cars) {
        car.brand = brandsDB2[0]._id;
        car.driver = usersDB2[0]._id;
        const item = new Car(car);
        await item.save();
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const setUsers = (): Promise<void> => {
  return new Promise(async (resolve) => {
    await User.deleteMany({}).exec();
    for (const user of users) {
      const item = new User(user);
      await item.save();
    }
    resolve();
  });
};

export const deleteAll = (): Promise<void> => {
  return new Promise(async (resolve) => {
    const modelsForDeleted: any = [Brand, Car, Image, Tournament, User];
    for (const model of modelsForDeleted) {
      await model.deleteMany({}).exec();
    }
    resolve();
  });
};

export const api = supertest(app);
