import { UserTokenI } from '@auth';
import { Brand } from '@brand';
import { IdSiteDto, SearchDto } from '@dtos';
import { InscriptionService } from '@inscription';
import { MessageI, PaginatorI } from '@interfaces';
import { Like } from '@like';
import { UtilsService, Logger } from '@services';
import { VoteService } from '@vote';
import {
  Car,
  CarCreateDto,
  carGetAllAggregate,
  CarGetAllDto,
  carGetAllDriverCarsAggregate,
  carGetAllOfBrandAggregate,
  carGetOneAggregate,
  CarI,
  CarUpdateDto,
  CarRankingI,
  carGetGlobalRanking,
  CarGetGlobalRankingDto,
  CarRankingItemsI,
  CarHelper,
  carSearchAggregate,
} from '@car';
import { User } from '@user';
import { Image } from '@image';

export class CarService {
  private inscriptionService = new InscriptionService();
  private voteService = new VoteService();
  private utilsService = new UtilsService();
  private helper = new CarHelper();
  private populateDefault = [
    {
      path: 'driver',
      select: 'name',
    },
    {
      path: 'brand',
      select: 'name country continent',
      populate: { path: 'image', select: 'url' },
    },
    { path: 'inscriptions' },
    { path: 'images', select: 'url firstImage position' },
  ];

  getAll(
    body: CarGetAllDto
  ): Promise<{ items: CarI[]; paginator: PaginatorI }> {
    return new Promise(async (resolve, reject) => {
      try {
        const { pageSize, currentPage, skip } =
          this.utilsService.getValuesForPaginator(body);
        const aggregate = carGetAllAggregate(
          this.utilsService,
          body,
          skip,
          pageSize
        );
        const items = await Car.aggregate(aggregate).exec();
        const total = await Car.countDocuments({}).exec();
        const totalPages = Math.ceil(total / pageSize);
        const paginator: PaginatorI = {
          pageSize,
          currentPage,
          totalPages,
          total,
        };
        resolve({ items, paginator });
      } catch (error) {
        reject(error);
      }
    });
  }

  async getAllDriverCars(id: string): Promise<CarI[]> {
    try {
      const aggregate = carGetAllDriverCarsAggregate(id);
      const items = await Car.aggregate(aggregate).exec();
      return items;
    } catch (error) {
      return error;
    }
  }

  async getAllBrandCars(id: string): Promise<CarI[]> {
    try {
      const aggregate = carGetAllOfBrandAggregate(id);
      const items = await Car.aggregate(aggregate).exec();
      return items;
    } catch (error) {
      return error;
    }
  }

  async getGlobalRanking(body: CarGetGlobalRankingDto): Promise<CarRankingI[]> {
    try {
      let dataDB: CarRankingItemsI = {
        cars: [],
        votes: [],
        pairings: [],
        winners: [],
        likes: [],
        inscriptions: [],
      };
      const aggregate: any = carGetGlobalRanking();
      switch (body.order) {
        case 'votes':
        case 'pairings':
        case 'pairingsWinners':
        case 'tournamentsWinners':
        case 'winners':
          await this.helper.getDataForMultiplesValuesRanking(dataDB, aggregate);
          break;
        case 'inscriptions':
          dataDB = await this.helper.getDataForInscriptionsRanking(
            dataDB,
            aggregate
          );
          break;
        case 'likes':
          dataDB = await this.helper.getDataForLikesRanking(dataDB, aggregate);
          break;

        default:
          break;
      }

      const cars: CarRankingI[] = this.helper.setCarsRanking(dataDB, body);
      return cars;
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  async getCarStats(): Promise<any> {
    try {
      const cars = await Car.find({}).populate(this.populateDefault);
      let items = await this.helper.generateItemsForCarStats(cars);
      for (const car of cars) {
        items = this.helper.setForCarStats('fuel', car, items);
        items = this.helper.setForCarStats('traction', car, items);
        items = this.helper.setForCarStats('stock', car, items);
        items = this.helper.setForCarStats('year', car, items);
        items = this.helper.setForCarStats('cc', car, items);
        items = this.helper.setForCarStats('cv', car, items);
        items = this.helper.setForCarStats('brand', car, items);
        items = this.helper.setForCarStats('country', car, items);
        items = this.helper.setForCarStats('continent', car, items);
      }
      return items;
    } catch (error) {
      return error;
    }
  }

  async search(data: SearchDto) {
    try {
      const aggregate: any = carSearchAggregate(data);
      const items = await Car.aggregate(aggregate).exec();
      return items;
    } catch (error) {
      return error;
    }
  }

  async getOne(data: IdSiteDto, user?: UserTokenI): Promise<CarI> {
    return new Promise(async (resolve, reject) => {
      try {
        let item: CarI;
        const aggregate = carGetOneAggregate(data.id);
        if (user) {
          if (data.site === 'admin' && user.role === 'ADMIN') {
            item = await this.helper.getOneForAdmin(
              data,
              this.populateDefault,
              reject
            );
          } else {
            item = await this.helper.getOneForUser(
              aggregate,
              user,
              reject
            );
          }
        } else {
          item = await this.helper.getOneAggregate(aggregate, reject);
        }
        resolve(item);
      } catch (error) {
        Logger.error(error);
        reject(error);
      }
    });
  }

  create(body: CarCreateDto): Promise<CarI> {
    return new Promise(async (resolve, reject) => {
      try {
        const item = new Car(body);
        const newItem = await item.save();
        const images = await Image.find({
          car: newItem._id.toString(),
        }).exec();
        newItem.images = images;
        resolve(newItem);
      } catch (error) {
        reject(error);
      }
    });
  }

  async createFakeCars(total: number): Promise<MessageI> {
    try {
      const usersFake = await User.find({ role: 'FAKE' }).exec();
      const brands = await Brand.find({}).exec();
      const tractions = ['FWD', 'RWD', 'AWD', '4WD', '4X4'];
      const fuel = ['gasoline', 'diesel', 'electric', 'hybrid'];
      for (let i = 0; i < total; i++) {
        const body: CarCreateDto = {
          driver: usersFake[Math.floor(Math.random() * usersFake.length)]._id,
          brand: brands[Math.floor(Math.random() * brands.length)]._id,
          model: 'FAKE',
          fuel: fuel[Math.floor(Math.random() * 4)],
          cc: Math.floor(Math.random() * (2500 - 1000)) + 1000,
          cv: Math.floor(Math.random() * (400 - 75)) + 100,
          traction: tractions[Math.floor(Math.random() * 5)],
          year: Math.floor(Math.random() * (2022 - 2000 + 1)) + 2000,
          stock: true,
        };
        await this.create(body);
      }
      return { message: `${total} coches falsos creados` };
    } catch (error) {
      return error;
    }
  }

  async update(body: CarUpdateDto): Promise<CarI> {
    return new Promise(async (resolve, reject) => {
      try {
        const item: CarI = await Car.findByIdAndUpdate(body._id, body, {
          new: true,
        }).exec();
        const images = await Image.find({ car: item._id.toString() }).exec();
        item.images = images;
        resolve(item);
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteOne(id: string, force = false, user?: UserTokenI): Promise<CarI> {
    try {
      if (force === true) {
        if (user && user.role === 'ADMIN') {
          return await this.deleteOneForce(id);
        } else {
          await this.deleteUserCar(id);
        }
      } else {
        return await this.deleteUserCar(id);
      }
    } catch (error) {
      return error;
    }
  }

  async deleteUserCar(id: string) {
    const inscriptions = await this.inscriptionService.getAllCarInscriptions({
      id,
      limit: '10000',
    });
    if (inscriptions.length > 0) {
      return null;
    } else {
      return this.deleteOneForce(id);
    }
  }

  async deleteOneForce(id: string) {
    try {
      await this.inscriptionService.deleteAllOfCar(id);
      await this.voteService.deleteAllOfCar(id);
      return Car.findByIdAndDelete(id).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteAllOfDriver(id: string): Promise<MessageI> {
    const cars = await this.getAllDriverCars(id);
    for (const car of cars) {
      await this.deleteOne(car._id);
    }
    return { message: `${cars.length} coches eliminados` };
  }

  async deleteAllOfBrand(id: string): Promise<MessageI> {
    const cars = await Car.find({ brand: id.toString() }).exec();
    for (const car of cars) {
      await this.deleteOne(car._id);
    }
    return { message: `${cars.length} coches eliminados` };
  }

  async deleteAllFake(): Promise<MessageI> {
    const users = await User.find({ role: 'FAKE' }).exec();
    for (const user of users) {
      await this.deleteAllOfDriver(user._id);
    }
    return {
      message: `Todos los coches de usuarios falsos eliminados`,
    };
  }

  async deleteAllFakeWithoutPhoto() {
    try {
      const users = await User.find({ role: 'FAKE' }).exec();
      for (const user of users) {
        const cars = await this.getAllDriverCars(user._id);
        const carsWithoutPhoto = cars.filter((car) => !car.images);
        for (const car of carsWithoutPhoto) {
          await this.deleteOne(car._id);
        }
      }
      return {
        message: `Todos los coches de usuarios falsos sin foto eliminados`,
      };
    } catch (error) {
      return error;
    }
  }
}
