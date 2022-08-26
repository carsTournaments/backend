import { UserTokenI } from '@auth';
import { GetAllDto, IdSiteDto } from '@dtos';
import { PaginatorI } from '@interfaces';
import { UtilsService } from '@services';
import { Tournament } from '@tournament';
import { WinnerService } from '@winner';
import { PairingService } from '@pairing';
import {
  roundGetAllAggregate,
  RoundI,
  Round,
  RoundUpdateDto,
  roundGetAllOfTournamentAggregate,
} from '@round';

export class RoundService {
  private pairingService = new PairingService();
  private winnerService = new WinnerService();
  private utilsService = new UtilsService();
  private populateDefault = [
    {
      path: 'tournament',
      select: 'name',
      populate: { path: 'image', select: 'url' },
    },
    { path: 'votes', select: 'name' },
  ];

  async getAll(
    body?: GetAllDto
  ): Promise<{ items: RoundI[]; paginator: PaginatorI } | RoundI[]> {
    try {
      if (body) {
        const { pageSize, currentPage, skip } =
          this.utilsService.getValuesForPaginator(body);
        const sort = this.utilsService.getOrderForGetAllAggregate(body);
        const aggregate: any = roundGetAllAggregate(sort, skip, pageSize);
        const items: RoundI[] = await Round.aggregate(aggregate).exec();
        const total = await Round.countDocuments({}).exec();
        const totalPages = Math.ceil(total / pageSize);
        const paginator: PaginatorI = {
          pageSize,
          currentPage,
          totalPages,
          total,
        };
        return { items, paginator };
      } else {
        return Round.find({}).populate(this.populateDefault).exec();
      }
    } catch (error) {
      return error;
    }
  }

  async getAllTournamentRounds(
    data: IdSiteDto,
    user?: UserTokenI
  ): Promise<RoundI[]> {
    try {
      if (user && user.role === 'ADMIN' && data.site === 'admin') {
        const items: RoundI[] = await Round.find({ tournament: data.id })
          .populate(this.populateDefault)
          .exec();
        return items;
      } else {
        const aggregate: any = roundGetAllOfTournamentAggregate(data.id);
        const items: RoundI[] = await Round.aggregate(aggregate).exec();
        return items;
      }
    } catch (error) {
      return error;
    }
  }

  async getOne(id: string): Promise<RoundI> {
    try {
      return Round.findById(id).exec();
    } catch (error) {
      return error;
    }
  }

  async update(body: RoundUpdateDto): Promise<RoundI> {
    try {
      return Round.findByIdAndUpdate(body._id, body, {
        new: true,
      }).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteOne(id: string): Promise<RoundI> {
    try {
      await this.pairingService.deleteAllOfRound(id);
      return Round.findByIdAndDelete(id).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteAllOfTournament(id: string): Promise<RoundI[]> {
    try {
      // delete winners
      await this.winnerService.deleteOfTournament(id);
      const tournament = await Tournament.findById(id).exec();
      tournament.status = 'Cancelled';
      const rounds = await this.getAllTournamentRounds({ id, site: 'admin' });
      for (const round of rounds) {
        await this.deleteOne(round._id);
      }
      await tournament.save();
      return rounds;
    } catch (error) {
      return error;
    }
  }
}
