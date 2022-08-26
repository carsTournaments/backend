import { AnalyticsController } from '@analytics';
import { AuthController } from '@auth';
import { Brand, BrandController } from '@brand';
import { Car, CarController } from '@car';
import { DefaultController } from '@default';
import { Image, ImageController } from '@image';
import { InscriptionController } from '@inscription';
import { LikeController } from '@like';
import { LiteralController } from '@literal';
import { MenuController } from '@menu';
import { NotificationController } from '@notification';
import { OtaController } from '@ota';
import { PairingController } from '@pairing';
import { ReportController } from '@report';
import { RoundController } from '@round';
import { SearchController } from '@search';
import { SettingsController } from '@settings';
import { StatsController } from '@stats';
import { ToggleController } from '@toggle';
import { Tournament, TournamentController } from '@tournament';
import { User, UserController } from '@user';
import { VoteController } from '@vote';
import { WinnerController } from '@winner';
import app from './../../app';
import supertest from 'supertest';
import { brands, users, cars } from '@testing/mocks/models.mock';
import { getAllFromBrands, getAllFromUsers } from './helpers';

const server = new app([
  new AnalyticsController(),
  new AuthController(),
  new BrandController(),
  new CarController(),
  new DefaultController(),
  new ImageController(),
  new InscriptionController(),
  new LikeController(),
  new LiteralController(),
  new MenuController(),
  new NotificationController(),
  new OtaController(),
  new PairingController(),
  new ReportController(),
  new RoundController(),
  new SearchController(),
  new SettingsController(),
  new StatsController(),
  new ToggleController(),
  new TournamentController(),
  new UserController(),
  new VoteController(),
  new WinnerController(),
]);

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

export const api = supertest(server.app);
