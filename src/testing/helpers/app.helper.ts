import supertest from 'supertest';
import { brands, users, cars, tournaments } from '@testing/mocks/models.mock';
import { getAllFromBrands, getAllFromUsers } from './helpers';
import { User } from '@user';
import { Brand } from '@brand';
import { Car } from '@car';
import app from '../../app';
import { Tournament } from '@tournament';

export const setMockCars = (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      await setMockUsers();
      await setMockBrands();

      const { items: brandsDB } = await getAllFromBrands();
      const { items: usersDB } = await getAllFromUsers();

      for (const car of cars) {
        car.brand = brandsDB[0]._id;
        car.driver = usersDB[0]._id;
        const item = new Car(car);
        await item.save();
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const setMockBrands = async () => {
  for (const brand of brands) {
    const item = new Brand(brand);
    await item.save();
  }
};

export const setMockTournaments = async () => {
  for (const tournament of tournaments) {
    const tournamentObj = new Tournament(tournament);
    await tournamentObj.save();
  }
};

export const setMockUsers = (): Promise<void> => {
  return new Promise(async (resolve) => {
    await User.deleteMany({}).exec();
    for (const user of users) {
      const item = new User(user);
      await item.save();
    }
    resolve();
  });
};

export const api = supertest(app);
