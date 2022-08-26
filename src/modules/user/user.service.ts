import { Pairing } from '@pairing';
import { UserTokenI } from '@auth';
import { CarService, Car, CarI } from '@car';
import { Inscription } from '@inscription';
import { MessageI, PaginatorI } from '@interfaces';
import { Like } from '@like';
import { Vote } from '@vote';
import { Winner, WinnerI } from '@winner';
import {
  User,
  userGetAllAggregate,
  UserGetAllDto,
  UserGetResumeResponse,
  UserI,
  userSearchAggregate,
} from '@user';
import { randEmail, randFullName } from '@ngneat/falso';
import { UtilsService, Logger } from '@services';
import { CacheService } from '@cache';
import { SearchDto } from '@dtos';

export class UserService {
  private carService = new CarService();
  private utilsService = new UtilsService();
  private cacheService = new CacheService();
  private populateDefault = [
    { path: 'cars', select: 'name' },
    { path: 'image', select: 'url' },
  ];

  async getAll(
    body?: UserGetAllDto
  ): Promise<{ items: UserI[]; paginator: PaginatorI } | UserI[]> {
    try {
      if (body) {
        if (body.onlyFCM) {
          const users = await User.find({ fcm: { $ne: null } })
            .limit(body.pageSize)
            .exec();
          return users;
        } else {
          const { pageSize, currentPage, skip } =
            this.utilsService.getValuesForPaginator(body);
          const aggregate = userGetAllAggregate(
            this.utilsService,
            body,
            skip,
            pageSize
          );
          const items = await User.aggregate(aggregate).exec();
          const total = await User.find({}).countDocuments().exec();
          const totalPages = Math.ceil(total / pageSize);
          const paginator: PaginatorI = {
            pageSize,
            currentPage,
            totalPages,
            total,
          };

          return { items, paginator };
        }
      } else {
        return User.find({}).populate(this.populateDefault).exec();
      }
    } catch (error) {
      return error;
    }
  }

  async getResume(user: UserTokenI): Promise<UserGetResumeResponse> {
    try {
      const items: UserGetResumeResponse = {
        likes: 0,
        votes: 0,
        inscriptions: 0,
        tournamentsWinners: '',
        pairings: 0,
        pairingsWinners: 0,
      };

      const cars = await Car.find({ driver: user._id }).exec();
      if (cars.length > 0) {
        items.inscriptions = await Inscription.countDocuments({
          car: { $in: cars.map((car: any) => car) },
        }).exec();
        items.likes = await Like.countDocuments({
          car: { $in: cars.map((car: any) => car) },
        }).exec();
        const winners = await Winner.find({}).exec();
        items.tournamentsWinners += `${this.getWinnersByType(
          'gold',
          winners,
          cars
        )}/`;
        items.tournamentsWinners += `${this.getWinnersByType(
          'silver',
          winners,
          cars
        )}/`;
        items.tournamentsWinners += this.getWinnersByType(
          'bronze',
          winners,
          cars
        );
        items.votes = await Vote.countDocuments({
          car: { $in: cars.map((car: any) => car) },
        }).exec();
        // pairings
        const pairingsC1 = await Pairing.countDocuments({
          car1: { $in: cars.map((car: any) => car) },
        }).exec();
        const pairingsC2 = await Pairing.countDocuments({
          car2: { $in: cars.map((car: any) => car) },
        }).exec();
        items.pairings = pairingsC1 + pairingsC2;
        items.pairingsWinners = await Winner.countDocuments({
          winner: { $in: cars.map((car: any) => car) },
        }).exec();
      }

      this.cacheService.set('user.getResume', user._id, JSON.stringify(items));
      return items;
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  private getWinnersByType(
    type: 'gold' | 'silver' | 'bronze',
    winners: WinnerI[],
    cars: CarI[]
  ): number {
    return winners.filter((winner: WinnerI) => {
      const state = cars.filter(
        (car: CarI) => car._id.toString() === winner[type].toString()
      );
      return state.length > 0;
    }).length;
  }

  async search(data: SearchDto) {
    try {
      const aggregate: any = userSearchAggregate(data);
      const items = await User.aggregate(aggregate).exec();
      return items;
    } catch (error) {
      return error;
    }
  }

  getOne(id: string): Promise<UserI> {
    return new Promise(async (resolve, reject) => {
      try {
        const item = await User.findById(id).exec();
        if (item) {
          if (item.password) {
            item.password = undefined;
          }
          this.cacheService.set('user.getOne', id, JSON.stringify(item));
          resolve(item);
        } else {
          reject({ message: 'El id no existe' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }
  async create(body: UserI): Promise<UserI> {
    try {
      const item = new User(body);
      return await item.save();
    } catch (error) {
      return error;
    }
  }

  async createFakeUsers(total: number): Promise<MessageI> {
    try {
      for (let i = 0; i < total; i++) {
        const body: UserI = {
          name: randFullName(),
          email: randEmail(),
          country: '',
          password: '123456',
          role: 'FAKE',
        };
        await this.create(body);
      }
      return { message: `${total} usuarios falsos creados` };
    } catch (error) {
      return error;
    }
  }

  update(body: UserI) {
    try {
      return User.findByIdAndUpdate(body._id, body, {
        new: true,
      }).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteOne(id: string) {
    try {
      await this.carService.deleteAllOfDriver(id);
      return User.findByIdAndDelete(id).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteAllFake(): Promise<MessageI> {
    try {
      const users = await this.getAll();
      if (users instanceof Array) {
        const fakeUsers = users.filter((user) => user.role === 'FAKE');
        for (const user of fakeUsers) {
          await this.deleteOne(user._id);
        }
        return {
          message: `${fakeUsers.length} usuarios falsos eliminados`,
        };
      }
    } catch (error) {
      return error;
    }
  }
}
