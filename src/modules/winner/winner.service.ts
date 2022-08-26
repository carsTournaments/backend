import { Logger } from '@services';
import { GetAllDto } from '@dtos';
import { MessageI, PaginatorI } from '@interfaces';
import { UtilsService } from '@services';
import { Vote } from '@vote';
import {
  Winner,
  WinnerI,
  WinnerGetOfTournamentCompleteResponse,
  WinnerCreateDto,
  WinnerUpdateDto,
  WinnerGetAllUserWinnersResponse,
  WinnerGetAllCarWinnersAggregate,
} from '@winner';
import { Car } from '../car/car.model';

export class WinnerService {
  private utilsService = new UtilsService();
  private populateDefault = [
    {
      path: 'tournament',
      select: 'name endDate',
      populate: { path: 'image', select: 'url' },
    },
    {
      path: 'gold',
      select: 'brand model driver',
      populate: { path: 'brand images driver', select: 'url name country' },
    },
    {
      path: 'silver',
      select: 'brand model driver',
      populate: { path: 'brand images driver', select: 'url name country' },
    },
    {
      path: 'bronze',
      select: 'brand model driver',
      populate: { path: 'brand images driver', select: 'url name country' },
    },
  ];
  async getAll(
    body?: GetAllDto
  ): Promise<{ items: WinnerI[]; paginator: PaginatorI } | WinnerI[]> {
    try {
      if (body) {
        const { pageSize, currentPage, skip } =
          this.utilsService.getValuesForPaginator(body);
        const sort = this.utilsService.getOrderForGetAll(body);
        const items: WinnerI[] = await Winner.find({})
          .populate(this.populateDefault)
          .skip(skip)
          .limit(pageSize)
          .sort(sort)
          .exec();
        const total = await Winner.find({}).countDocuments().exec();
        const totalPages = Math.ceil(total / pageSize);
        const paginator: PaginatorI = {
          pageSize,
          currentPage,
          totalPages,
          total,
        };
        return { items, paginator };
      } else {
        return await Winner.find({}).populate(this.populateDefault).exec();
      }
    } catch (error) {
      return error;
    }
  }

  getForTournament(tournamentId: string): Promise<WinnerI> {
    try {
      return Winner.findOne({
        tournament: tournamentId,
      })
        .populate(this.populateDefault)
        .exec();
    } catch (error) {
      return error;
    }
  }

  getForTournamentComplete(
    tournamentId: string
  ): Promise<WinnerGetOfTournamentCompleteResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const item: WinnerGetOfTournamentCompleteResponse = {
          gold: { car: null, votes: 0 },
          silver: { car: null, votes: 0 },
          bronze: { car: null, votes: 0 },
        };
        const winner = await Winner.findOne({ tournament: tournamentId })
          .populate(this.populateDefault)
          .exec();
        if (winner) {
          item.gold.car = winner.gold;
          item.silver.car = winner.silver;
          item.bronze.car = winner.bronze;
          item.gold.votes = (
            await Vote.find({
              car: winner.gold._id.toString(),
              tournament: tournamentId.toString(),
            }).exec()
          ).length;
          item.silver.votes = (
            await Vote.find({
              car: winner.silver._id.toString(),
              tournament: tournamentId.toString(),
            }).exec()
          ).length;
          item.bronze.votes = (
            await Vote.find({
              car: winner.bronze._id.toString(),
              tournament: tournamentId.toString(),
            }).exec()
          ).length;
          resolve(item);
        } else {
          reject({ message: 'No hay ganadores para este torneo' });
        }
      } catch (error) {
        return error;
      }
    });
  }

  getAllTournamentWinners(tournamentId: string): Promise<WinnerI[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const winner = await this.getForTournament(tournamentId);
        if (winner) {
          resolve([winner]);
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async getAllCarWinners(carId: string): Promise<WinnerI[]> {
    try {
      const aggregate: any = WinnerGetAllCarWinnersAggregate(carId);
      const itemsAggregate = await Winner.aggregate(aggregate).exec();
      const items: WinnerI[] = [];
      for (const item of itemsAggregate) {
        const gold = this.setVotes(item, 'gold');
        const silver = this.setVotes(item, 'silver');
        const bronze = this.setVotes(item, 'bronze');
        items.push({
          _id: item._id,
          tournament: item.tournament,
          gold: gold,
          silver: silver,
          bronze: bronze,
          created: item.created,
        });
      }
      return items;
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  private setVotes(item: WinnerI, type: 'gold' | 'silver' | 'bronze'): number {
    if (item[type].votes && item[type].votes.length > 0) {
      item[type].votes = item[type].votes[0].count;
    } else {
      item[type].votes = 0;
    }
    return item[type];
  }

  async getAllUserWinners(
    userId: string
  ): Promise<WinnerGetAllUserWinnersResponse[]> {
    try {
      // Obtener coches del usuario
      const cars = await Car.find({ driver: userId }).exec();
      const items: WinnerGetAllUserWinnersResponse[] = [];
      for (const car of cars) {
        const item: WinnerGetAllUserWinnersResponse = {
          car,
          gold: [],
          silver: [],
          bronze: [],
        };

        const winners = await this.getAllCarWinners(car._id.toString());
        for (const winner of winners) {
          if (winner.gold._id.toString() === car._id.toString()) {
            item.car = winner.gold;
            item.gold.push(winner.tournament);
          } else if (winner.silver._id.toString() === car._id.toString()) {
            item.car = winner.silver;
            item.silver.push(winner.tournament);
          } else if (winner.bronze._id.toString() === car._id.toString()) {
            item.car = winner.bronze;
            item.bronze.push(winner.tournament);
          }
        }
        items.push(item);
      }
      // filter items with 0 values
      const filteredItems = items.filter((item) => {
        return item.gold.length + item.silver.length + item.bronze.length > 0;
      });
      return filteredItems;

      // find is winner with car and separate for gold silver and bronze

      // const gold: any = []
      // const silver: any = []
      // const bronze: any = []
      // winners.forEach(winner => {
      //     if (winner.gold && cars.find(car => car._id.toString() === winner.gold._id.toString())) {
      //         const item = {
      //             tournament: winner.tournament,
      //             car: winner.gold,
      //         }
      //         gold.push(item)
      //     }
      //     if (winner.silver && cars.find(car => car._id.toString() === winner.silver._id.toString())) {
      //         const item = {
      //             tournament: winner.tournament,
      //             car: winner.silver,
      //         }
      //         silver.push(item)
      //     }
      //     if (winner.bronze && cars.find(car => car._id.toString() === winner.bronze._id.toString())) {
      //         const item = {
      //             tournament: winner.tournament,
      //             car: winner.bronze,
      //         }
      //         bronze.push(item)
      //     }
      // })
      // return {
      //     gold,
      //     silver,
      //     bronze,
      // }
    } catch (error) {
      return error;
    }
  }

  getOne(id: string): Promise<WinnerI> {
    try {
      return Winner.findById(id).populate(this.populateDefault).exec();
    } catch (error) {
      return error;
    }
  }

  async create(body: WinnerCreateDto): Promise<WinnerI> {
    try {
      const item = new Winner(body);
      return await item.save();
    } catch (error) {
      return error;
    }
  }

  async update(body: WinnerUpdateDto): Promise<WinnerI> {
    try {
      return Winner.findByIdAndUpdate(body._id, body, {
        new: true,
      }).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteOne(id: string): Promise<WinnerI> {
    try {
      return Winner.findByIdAndDelete(id).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteOfTournament(tournamentId: string): Promise<MessageI> {
    try {
      const winner = await this.getForTournament(tournamentId);
      if (winner) {
        await this.deleteOne(winner._id);
        return {
          message: `Ganadores del torneo ${tournamentId} eliminados`,
        };
      } else {
        throw {
          message: `No hay ganadores para el torneo ${tournamentId}`,
        };
      }
    } catch (error) {
      return error;
    }
  }
}
