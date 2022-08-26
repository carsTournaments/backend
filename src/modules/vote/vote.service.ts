import { MessageI, PaginatorI } from '@interfaces';
import { UtilsService } from '@services';
import { Round } from '@round';
import {
  VoteI,
  Vote,
  VoteGetAllDto,
  VoteGetAllOfGenericDto,
  VoteCreateDto,
  voteGetAllCarVotesAggregate,
  voteGetAllTournamentVotesAggregate,
  voteGetAllAggregate,
  VoteCreateFakeVotesDto,
} from '@vote';
import { Logger } from '@services';
import { CacheService } from '@cache';
import { v4 as uuidv4 } from 'uuid';

export class VoteService {
  private utilsService = new UtilsService();
  private cacheService = new CacheService();
  private populateDefault = [
    {
      path: 'pairing',
      populate: {
        path: 'round',
        select: 'name tournament',
        populate: {
          path: 'tournament',
          select: 'name',
          populate: {
            path: 'image',
            select: 'url',
          },
        },
      },
    },
    {
      path: 'car',
      populate: {
        path: 'images brand',
        select: 'url name',
      },
    },
  ];

  async getAll(
    body?: VoteGetAllDto
  ): Promise<{ items: VoteI[]; paginator: PaginatorI } | VoteI[]> {
    try {
      if (body) {
        const { pageSize, currentPage, skip } =
          this.utilsService.getValuesForPaginator(body);
        const sort = this.utilsService.getOrderForGetAllAggregate(body);
        const aggregate: any = voteGetAllAggregate(sort, skip, pageSize);
        const items: VoteI[] = await Vote.aggregate(aggregate).exec();
        const total = await Vote.find({}).countDocuments().exec();
        const totalPages = Math.ceil(total / pageSize);
        const paginator: PaginatorI = {
          pageSize,
          currentPage,
          totalPages,
          total,
        };
        return { items, paginator };
      } else {
        return Vote.find({}).populate(this.populateDefault).exec();
      }
    } catch (error) {
      return error;
    }
  }

  getAllCarVotes(data: VoteGetAllOfGenericDto): Promise<VoteI[]> {
    try {
      const aggregate: any = voteGetAllCarVotesAggregate(data);
      return Vote.aggregate(aggregate).exec();
    } catch (error) {
      return error;
    }
  }

  getAllTournamentVotes(data: VoteGetAllOfGenericDto): Promise<VoteI[]> {
    try {
      const aggregate: any = voteGetAllTournamentVotesAggregate(data);
      return Vote.aggregate(aggregate).exec();
    } catch (error) {
      return error;
    }
  }

  getOne(id: string): Promise<VoteI> {
    try {
      return Vote.findById(id).exec();
    } catch (error) {
      return error;
    }
  }

  async create(body: VoteCreateDto): Promise<VoteI> {
    return new Promise(async (resolve, reject) => {
      try {
        const round = await Round.findById(body.round).exec();
        if (round) {
          if (round.status === 'InProgress') {
            let query = {};
            if (body.user) {
              query = { pairing: body.pairing, user: body.user };
            } else if (body.uuid) {
              query = { pairing: body.pairing, uuid: body.uuid };
            } else {
              reject({ message: 'Usuario o UUID es obligatorio' });
            }
            const existVote = await Vote.findOne(query).exec();
            if (existVote) {
              reject({ message: '¡Tu ya has votado esta carrera!' });
            } else {
              this.cacheService.deleteByCategory('tournament');
              const vote = new Vote(body);
              await vote.save();
              resolve(vote);
            }
          } else {
            reject({ message: 'La ronda no esta en curso' });
          }
        } else {
          reject({ message: 'La ronda no existe' });
        }
      } catch (error) {
        Logger.error(error);
        return error;
      }
    });
  }

  createFakeVotes(data: VoteCreateFakeVotesDto): Promise<MessageI> {
    return new Promise(async (resolve, reject) => {
      try {
        let totalCreated = 0;
        let round: any;
        if (data.round) {
          // votos aleatorios a pairing
          for (let i = 0; i < data.total; i++) {
            await this.createFakeVotesWithRound(data.round, reject);
            totalCreated++;
          }
        } else {
          //   const aggregate = voteCreateFakeVotesAggregate();
          const rounds = await Round.find({ status: 'InProgress' }).exec();
          for (let i = 0; i < data.total; i++) {
            const random = Math.floor(Math.random() * rounds.length);
            round = rounds[random];
            await this.createFakeVotesWithRound(round._id, reject);
            totalCreated++;
          }
        }
        resolve({ message: `Se han creado ${totalCreated} votos` });
      } catch (error) {
        reject(error);
      }
    });
  }

  private async createFakeVotesWithRound(
    roundId: any,
    reject: (reason?: any) => void
  ): Promise<void> {
    try {
      const round: any = await Round.findById(roundId)
        .populate({
          path: 'pairings',
        })
        .exec();
      if (round && round.pairings.length > 0) {
        const random = Math.floor(Math.random() * round.pairings.length);
        const pairing = round.pairings[random];
        if (pairing && pairing._id) {
          let carNumber = Math.floor(Math.random() * 3);
          if (carNumber === 0) {
            carNumber = 1;
          }
          const car = pairing['car' + carNumber];
          const obj: VoteI = {
            pairing: pairing._id,
            car,
            uuid: uuidv4(),
            tournament: round.tournament,
            round: round._id,
          };
          const vote = new Vote(obj);
          await vote.save();
          return;
        } else {
          reject({ message: 'El pairing no existe' });
        }
      } else {
        reject({ message: 'La ronda no existe' });
      }
      return round;
    } catch (error) {
      reject(error);
    }
  }

  // Eliminamos votos sin usuario o uuid
  async cleanVotes(): Promise<MessageI> {
    try {
      let total = 0;
      const votes = await Vote.find({}).exec();
      for (let i = 0; i < votes.length; i++) {
        if (!votes[i].user && !votes[i].uuid) {
          await Vote.deleteOne({ _id: votes[i]._id }).exec();
          total++;
        }
      }
      return { message: `Se han eliminado ${total} votos` };
    } catch (error) {
      return error;
    }
  }

  async deleteOne(id: string): Promise<VoteI> {
    try {
      return Vote.findByIdAndDelete(id).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteAll() {
    try {
      return Vote.deleteMany({}).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteAllOfCar(carId: string) {
    try {
      return Vote.deleteMany({ car: carId }).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteAllOfPairing(pairingId: string) {
    try {
      return Vote.deleteMany({ pairing: pairingId }).exec();
    } catch (error) {
      return error;
    }
  }
}
