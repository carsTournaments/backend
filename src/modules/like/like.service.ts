import { Car } from '@car';
import { GetAllDto, SearchDto } from '@dtos';
import { MessageI, PaginatorI } from '@interfaces';
import { UtilsService } from '@services';
import {
  Like,
  LikeGetAllOfCarDto,
  LikeGetAllReceivedForUserResponse,
  LikeI,
  likeGetAllCarLikesAggregate,
  likeGetAllUserSubmittedLikesAggregate,
  likeSearchAggregate,
} from '@like';
import { CacheService } from '../cache/cache.service';
import { LikeCreateFakeDto } from './like.dto';
import { User } from '@user';

export class LikeService {
  private utilsService = new UtilsService();
  private cacheService = new CacheService();
  private populateDefault = [
    {
      path: 'car',
      select: 'name model',
      populate: { path: 'images brand', select: 'url name' },
    },
    {
      path: 'user',
      select: 'name country',
    },
  ];

  async getAll(
    body?: GetAllDto
  ): Promise<{ items: LikeI[]; paginator: PaginatorI } | LikeI[]> {
    try {
      if (body) {
        const { pageSize, currentPage, skip } =
          this.utilsService.getValuesForPaginator(body);
        const sort = this.utilsService.getOrderForGetAll(body);
        const items: LikeI[] = await Like.find({})
          .populate(this.populateDefault)
          .skip(skip)
          .limit(pageSize)
          .sort(sort)
          .exec();
        const total = await Like.find({}).countDocuments().exec();
        const totalPages = Math.ceil(total / pageSize);
        const paginator: PaginatorI = {
          pageSize,
          currentPage,
          totalPages,
          total,
        };
        return { items, paginator };
      } else {
        return Like.find({}).populate(this.populateDefault).exec();
      }
    } catch (error) {
      return error;
    }
  }

  async getAllCarLikes(data: LikeGetAllOfCarDto): Promise<LikeI[]> {
    try {
      const aggregate: any = likeGetAllCarLikesAggregate(data);
      return Like.aggregate(aggregate).exec();
    } catch (error) {
      return error;
    }
  }

  async getAllReceivedForCar(carId: string) {
    try {
      return await Like.find({ car: carId })
        .sort({ created: -1 })
        .populate(this.populateDefault)
        .exec();
    } catch (error) {
      return error;
    }
  }

  async getAllReceivedForUser(
    userId: string
  ): Promise<LikeGetAllReceivedForUserResponse[]> {
    const items: LikeGetAllReceivedForUserResponse[] = [];
    const populate = [
      { path: 'likes' },
      { path: 'images', select: 'url' },
      { path: 'brand', select: 'name country' },
    ];
    const userCars = await Car.find({ driver: userId })
      .populate(populate)
      .select('model')
      .exec();
    for (const car of userCars) {
      const index = items.findIndex((item) => item.car._id === car._id);
      if (car.likes.length > 0) {
        if (index === -1) {
          const carItem: any = {
            _id: car._id,
            brand: car.brand,
            model: car.model,
            images: car.images,
          };
          items.push({
            car: carItem,
            likes: car.likes.length,
            lastLike: car.likes[car.likes.length - 1].created,
          });
        } else {
          items[index].likes += car.likes.length;
          items[index].lastLike = car.likes[car.likes.length - 1].created;
        }
      }
    }
    return items;
  }

  async getAllUserSubmittedLikes(userId: string): Promise<LikeI[]> {
    try {
      const aggregate: any = likeGetAllUserSubmittedLikesAggregate(userId);
      return Like.aggregate(aggregate).exec();
    } catch (error) {
      return error;
    }
  }

  async search(data: SearchDto) {
    try {
      const aggregate: any = likeSearchAggregate(data);
      const items = await Like.aggregate(aggregate).exec();
      return items;
    } catch (error) {
      console.error({ error });
      return error;
    }
  }

  create(body: LikeI): Promise<LikeI> {
    return new Promise(async (resolve, reject) => {
      try {
        if (body.car && body.user) {
          const isExist = await Like.findOne({
            car: body.car,
            user: body.user,
          }).exec();
          if (!isExist) {
            this.cacheService.deleteByCategory('like');
            resolve(Like.create(body));
          }
          reject({ message: '[LikeService] El like ya existe' });
        } else {
          reject({ message: '[LikeService] Faltan datos' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async createFake(data: LikeCreateFakeDto): Promise<MessageI> {
    try {
      const fakeUsers = await User.find({ role: 'FAKE' }).exec();
      if (!data.carId) {
        const cars = await Car.find({}).exec();
        for (let i = 0; i < data.total; i++) {
          const car = cars[Math.floor(Math.random() * cars.length)];
          const fakeUser =
            fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
          const like = new Like({
            car: car._id,
            user: fakeUser._id,
          });
          await like.save();
          this.cacheService.deleteByCategory('like');
        }
        return { message: `Se han creado ${data.total} likes` };
      } else {
        const fakeUser =
          fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
        for (let i = 0; i < data.total; i++) {
          const like = new Like({
            car: data.carId,
            user: fakeUser._id,
          });
          await like.save();
          this.cacheService.deleteByCategory('like');
        }
        return { message: `Se han creado el like` };
      }
    } catch (error) {
      return error;
    }
  }

  async cleanLikes(): Promise<MessageI> {
    try {
      const likes = await Like.find({}).exec();
      for (const like of likes) {
        const car = await Car.findById(like.car).exec();
        if (!car) {
          await Like.findByIdAndDelete(like._id).exec();
        }
      }
      return { message: 'Todos los likes invalidos han sido eliminados' };
    } catch (error) {
      return error;
    }
  }

  async deleteOne(id: string): Promise<LikeI> {
    try {
      return Like.findByIdAndDelete(id).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteByCarId(carId: string): Promise<MessageI> {
    try {
      await Like.deleteMany({ car: carId }).exec();
      return { message: 'Likes eliminados' };
    } catch (error) {
      return error;
    }
  }

  async deleteAllOfCar(carId: string): Promise<MessageI> {
    try {
      const cars = await this.getAllCarLikes({ id: carId, limit: '100000' });
      for (const car of cars) {
        await Like.findByIdAndDelete(car._id).exec();
      }
      return {
        message: `Todos los likes del coche ${carId} han sido eliminados`,
      };
    } catch (error) {
      return error;
    }
  }

  async deleteAll(): Promise<MessageI> {
    try {
      await Like.deleteMany({}).exec();
      return { message: 'Todos los likes han sido eliminados' };
    } catch (error) {
      return error;
    }
  }
}
