import { UserTokenI } from '@auth';
import { GetAllDto, IdSiteDto } from '@dtos';
import { MessageI, PaginatorI } from '@interfaces';
import { UtilsService, Logger } from '@services';
import { VoteService } from '@vote';
import {
  Pairing,
  PairingI,
  PairingMongoI,
  pairingGetAllAggregate,
  pairingGetOneAggregate,
} from '@pairing';

export class PairingService {
  private voteService = new VoteService();
  private utilsService = new UtilsService();
  private populateDefault = [
    {
      path: 'round',
      select: 'name tournament',
      populate: {
        path: 'tournament',
        select: 'name',
        populate: { path: 'image', select: 'url' },
      },
    },
    {
      path: 'car1',
      select: 'name model',
      populate: { path: 'images brand model', select: 'url name' },
    },
    {
      path: 'car2',
      select: 'name model',
      populate: { path: 'images brand model', select: 'url name' },
    },
    { path: 'votes', select: 'car' },
    {
      path: 'winner',
      select: 'name ',
      populate: { path: 'images brand model', select: 'url name' },
    },
  ];

  async getAll(
    body?: GetAllDto
  ): Promise<{ items: PairingI[]; paginator: PaginatorI } | PairingI[]> {
    try {
      if (body) {
        const { pageSize, currentPage, skip } =
          this.utilsService.getValuesForPaginator(body);
        const sort = this.utilsService.getOrderForGetAllAggregate(body);
        const aggregate = pairingGetAllAggregate(sort, skip, pageSize);
        const items = await Pairing.aggregate(aggregate).exec();
        const total = await Pairing.countDocuments({}).exec();
        const totalPages = Math.ceil(total / pageSize);
        const paginator: PaginatorI = {
          pageSize,
          currentPage,
          totalPages,
          total,
        };
        return { items, paginator };
      } else {
        return Pairing.find({}).populate(this.populateDefault).exec();
      }
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  async getAllRoundPairings(roundId: string): Promise<PairingMongoI[]> {
    try {
      return Pairing.find({ round: roundId })
        .populate(this.populateDefault)
        .exec();
    } catch (error) {
      return error;
    }
  }

  async getAllTournamentPairings(
    tournamentId: string
  ): Promise<PairingMongoI[]> {
    try {
      return Pairing.find({ tournament: tournamentId })
        .populate(this.populateDefault)
        .exec();
    } catch (error) {
      return error;
    }
  }

  async getOne(data: IdSiteDto, user: UserTokenI): Promise<PairingI> {
    try {
      const populateAdmin: any = [];
      if (user && user.role === 'ADMIN' && data.site === 'admin') {
        return Pairing.findById(data.id).populate(populateAdmin).exec();
      } else {
        const aggregate = pairingGetOneAggregate(data.id);
        const items = await Pairing.aggregate(aggregate).exec();
        if (items.length > 0) {
          return items[0];
        }
      }
    } catch (error) {
      return error;
    }
  }

  create(body: PairingI): Promise<PairingI> {
    try {
      const item = new Pairing(body);
      return item.save();
    } catch (error) {
      return error;
    }
  }

  async update(body: PairingI): Promise<PairingI> {
    try {
      return Pairing.findByIdAndUpdate(body._id, body, {
        new: true,
      }).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteOne(id: string): Promise<PairingI> {
    try {
      await this.voteService.deleteAllOfPairing(id);
      return Pairing.findByIdAndDelete(id).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteAllPairings(): Promise<MessageI> {
    try {
      const pairings = await this.getAll();
      if (pairings instanceof Array) {
        for (const pairing of pairings) {
          await this.deleteOne(pairing._id);
        }
      }
      return { message: 'Todos los emparejamientos eliminados' };
    } catch (error) {
      return error;
    }
  }

  async deleteAllOfRound(id: string): Promise<PairingI[]> {
    try {
      const pairings = await this.getAllRoundPairings(id);
      for (const pairing of pairings) {
        await this.deleteOne(pairing._id);
      }
    } catch (error) {
      return error;
    }
  }
}
