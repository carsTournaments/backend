import { Inscription } from '@inscription';
import { GetAllI, MessageI, PaginatorI } from '@interfaces';
import { Pairing } from '@pairing';
import { RoundService, RoundI, Round } from '@round';
import { UtilsService, Logger } from '@services';
import { Vote } from '@vote';
import { Winner } from '@winner';
import { CrontabService } from '@crontab';
import moment from 'moment';
import {
  tournamentGetAllAggregate,
  tournamentGetPairingsForDate,
} from './tournament.aggregate';
import {
  TournamentGetAllDto,
  TournamentCreateDto,
  TournamentForceNextRoundDto,
  TournamentUpdateDto,
} from './tournament.dto';
import { TournamentHelper } from './tournament.helper';
import { TournamentI, TournamentMongoI } from './tournament.interface';
import { Tournament } from './tournament.model';
import { CacheService } from '@cache';

export class TournamentService {
  private roundService = new RoundService();
  private utilsService = new UtilsService();
  private tournamnetHelper = new TournamentHelper();
  private crontabService = new CrontabService();
  private cacheService = new CacheService();

  async getAll(body: TournamentGetAllDto): Promise<GetAllI<TournamentI[]>> {
    try {
      const { pageSize, currentPage, skip } =
        this.utilsService.getValuesForPaginator(body);
      const sort = this.utilsService.getOrderForGetAllAggregate(body);
      const query = body.status ? { status: body.status } : {};
      const aggregate = tournamentGetAllAggregate(query, sort, skip, pageSize);
      const items = await Tournament.aggregate(aggregate).exec();
      const total = await Tournament.countDocuments(query).exec();
      const totalPages = Math.ceil(total / pageSize);
      const paginator: PaginatorI = {
        pageSize,
        currentPage,
        totalPages,
        total,
      };
      return { items, paginator };
    } catch (error) {
      return error;
    }
  }

  async getAllOfAllStates(): Promise<{
    todo: TournamentI[];
    inProgress: TournamentI[];
    completed: TournamentI[];
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        const populate = [
          { path: 'rounds', select: 'name status' },
          { path: 'image', select: 'url' },
          { path: 'inscriptions', select: 'car' },
        ];

        const select = 'name description startDate maxParticipants status';
        const tournamentsDB: TournamentI[] = await Tournament.find({})
          .select(select)
          .populate(populate)
          .exec();
        let todo: TournamentI[] = tournamentsDB.filter(
          (item) => item.status === 'Todo'
        );
        let inProgress: TournamentI[] = tournamentsDB.filter(
          (item) => item.status === 'InProgress'
        );
        let completed: TournamentI[] = tournamentsDB.filter(
          (item) => item.status === 'Completed'
        );
        todo = this.prepareItemsForGetAllOfStates(todo);
        inProgress = this.prepareItemsForGetAllOfStates(inProgress);
        completed = this.prepareItemsForGetAllOfStates(completed);
        const items = { todo, inProgress, completed };
        this.cacheService.set(
          'tournament.getAllOfAllStates',
          null,
          JSON.stringify(items)
        );
        resolve(items);
      } catch (error) {
        reject(error);
      }
    });
  }

  private prepareItemsForGetAllOfStates(items: TournamentI[]): TournamentI[] {
    try {
      const tournamentsOk: TournamentI[] = [];
      for (const item of items) {
        const lastRoundInProgress: RoundI = item.rounds.find(
          (round: RoundI) => round.status === 'InProgress'
        );
        const lastRound: RoundI =
          item.status === 'Completed'
            ? item.rounds[item.rounds.length - 1]
            : lastRoundInProgress;
        const tournament: TournamentI = {
          _id: item._id,
          name: item.name,
          startDate: item.startDate,
          maxParticipants: item.maxParticipants,
          status: item.status,
          image: item.image,
          lastRound: lastRound && lastRound?.name,
          inscriptions: item.inscriptions?.length,
          requisites: item.requisites,
          endDate: item.endDate,
          durationDays: item.durationDays,
        };
        tournamentsOk.push(tournament);
      }
      tournamentsOk.sort((a, b) =>
        moment(a.startDate).diff(moment(b.startDate), 'days')
      );
      return tournamentsOk;
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  getDaysForCalendar(): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const rounds = await Round.find({ status: 'InProgress' }).exec();
        const tournamentsTodo = await Tournament.find({
          status: 'Todo',
        }).exec();
        let days: string[] = [];
        days = this.getDaysForRounds(rounds, days);
        days = this.getDaysForTournamentsTodo(tournamentsTodo, days);
        days.sort((a, b) => moment(a).diff(moment(b), 'days'));
        this.cacheService.set(
          'tournament.getDaysForCalendar',
          null,
          JSON.stringify(days)
        );
        resolve(days);
      } catch (error) {
        reject(error);
      }
    });
  }

  private getDaysForTournamentsTodo(
    tournamentsTodo: TournamentI[],
    days: string[]
  ): string[] {
    for (const tournament of tournamentsTodo) {
      const day = moment(tournament.startDate).format('YYYY-MM-DD');
      if (!days.includes(day)) {
        days.push(day);
      }
    }
    return days;
  }

  private getDaysForRounds(rounds: RoundI[], days: string[]): string[] {
    for (const round of rounds) {
      const startDate =
        moment(round.startDate).format('YYYY-MM-DD') + ' 00:00:00';
      const endDate = moment(round.endDate).format('YYYY-MM-DD') + ' 00:00:00';
      const daysOfTournament = this.getDaysFromDates(startDate, endDate);
      for (const day of daysOfTournament) {
        if (!days.includes(day)) {
          days.push(day);
        }
      }
    }
    return days;
  }

  private getDaysFromDates(startDate: string, endDate: string): string[] {
    try {
      const days: string[] = [];
      // comprobar que startDate es menor que la fecha actual
      const startDateMoment = moment(startDate);
      const today = moment();
      const start = startDateMoment.isAfter(today) ? startDateMoment : today;
      const end = moment(endDate);
      const duration = end.diff(start, 'days');
      for (let i = 0; i <= duration; i++) {
        const day = moment(start).add(i, 'days').format('YYYY-MM-DD');
        if (!days.includes(day)) {
          days.push(day);
        }
      }
      return days;
    } catch (error) {
      return error;
    }
  }

  async getCalendarItems(
    date: string
  ): Promise<{ rounds: RoundI[]; tournaments: TournamentI[] }> {
    try {
      const aggregate: any = tournamentGetPairingsForDate();
      const roundsDB = await Round.aggregate(aggregate).exec();
        const rounds: RoundI[] = this.getItemsForRounds(roundsDB, date);
      const tournaments = await this.getItemsForTournaments(date);
      const items = { rounds, tournaments };
      this.cacheService.set(
        'tournament.getCalendarItems',
        date,
        JSON.stringify(items)
      );
      return { rounds, tournaments };
    } catch (error) {
      return error;
    }
  }

  private getItemsForRounds(roundsDB: any[], date: string): RoundI[] {
    try {
        const rounds: RoundI[] = [];
        console.log( roundsDB[0].pairings );
      for (const round of roundsDB) {
        const startDate =
          moment(round.startDate).format('YYYY-MM-DD') + ' 00:00:00';
        const endDate =
          moment(round.endDate).format('YYYY-MM-DD') + ' 23:59:59';
        const dateOk = date + ' 00:00:00';
        if (
          moment(startDate).unix() <= moment(dateOk).unix() &&
          moment(endDate).unix() >= moment(dateOk).unix()
        ) {
          rounds.push(round);
        }
      }
      return rounds;
    } catch (error) {
      return error;
    }
  }

  private async getItemsForTournaments(date: string): Promise<TournamentI[]> {
    try {
      const tournamentsDB = await Tournament.find({
        status: 'Todo',
      })
        .populate('image')
        .exec();
      const tournaments: TournamentI[] = [];

      for (const tournament of tournamentsDB) {
        const startDate = moment(tournament.startDate).format('YYYY-MM-DD');
        if (date === startDate) {
          tournaments.push(tournament);
        }
      }
      return tournaments;
    } catch (error) {
      return error;
    }
  }

  getOne(id: string): Promise<TournamentMongoI> {
    try {
      return Tournament.findById(id)
        .populate([
          { path: 'inscriptions', select: 'car' },
          { path: 'image', select: 'url' },
          { path: 'votes' },
        ])
        .populate('rounds')
        .exec();
    } catch (error) {
      return error;
    }
  }

  async create(body: TournamentCreateDto): Promise<TournamentI> {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.isItemValid(body)) {
          const item = new Tournament(body);
          this.cacheService.deleteByCategory('tournament');
          resolve(await item.save());
        } else {
          reject({ message: 'El torneo no es valido' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private isItemValid(item: TournamentCreateDto) {
    if (item.name === '') {
      return false;
    }
    return true;
  }

  async startTournament(tournamentId: string): Promise<MessageI> {
    const result = await this.tournamnetHelper.startTournament(tournamentId);
    this.crontabService.generateAutomaticsCrons();
    return result;
  }

  async resetTournament(tournamentId: string): Promise<TournamentI> {
    return new Promise(async (resolve, reject) => {
      try {
        const tournament: TournamentMongoI = await this.getOne(tournamentId);
        tournament.endDate = null;
        tournament.status = 'Todo';
        tournament.startDate = moment()
          .add(10, 'days')
          .format('YYYY-MM-DD HH:mm');
        const itemSaved = await this.onResetOrCancelTournament(
          tournamentId,
          tournament
        );
        this.cacheService.deleteByCategory('tournament');
        resolve(itemSaved);
      } catch (error) {
        reject(error);
      }
    });
  }

  async cancelTournament(tournamentId: string): Promise<TournamentI> {
    return new Promise(async (resolve, reject) => {
      try {
        const tournament: TournamentMongoI = await this.getOne(tournamentId);
        tournament.endDate = null;
        tournament.status = 'Cancelled';
        const itemSaved = await this.onResetOrCancelTournament(
          tournamentId,
          tournament
        );
        this.cacheService.deleteByCategory('tournament');
        resolve(itemSaved);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async onResetOrCancelTournament(
    tournamentId: string,
    tournament: TournamentMongoI
  ): Promise<TournamentMongoI> {
    await Inscription.deleteMany({ tournament: tournamentId }).exec();
    await Round.deleteMany({ tournament: tournamentId }).exec();
    await Pairing.deleteMany({ tournament: tournamentId }).exec();
    await Vote.deleteMany({ tournament: tournamentId }).exec();
    await Winner.deleteMany({ tournament: tournamentId }).exec();
    const itemSaved = await tournament.save();
    this.crontabService.generateAutomaticsCrons();
    return itemSaved;
  }

  async forceNextRound(body: TournamentForceNextRoundDto): Promise<MessageI> {
    const result = await this.tournamnetHelper.forceNextRound(body);
    this.crontabService.generateAutomaticsCrons();
    return result;
  }

  async update(body: TournamentUpdateDto): Promise<TournamentI> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.validationsForUpdate(body, reject);
        const itemUpdated = await Tournament.findByIdAndUpdate(body._id, body, {
          new: true,
        }).exec();
        await this.crontabService.generateAutomaticsCrons();
        this.cacheService.deleteByCategory('tournament');
        resolve(itemUpdated);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async validationsForUpdate(
    body: TournamentUpdateDto,
    reject: (reason?: any) => void
  ): Promise<void> {
    const item = await Tournament.findById(body._id).exec();
    if (body.status === 'InProgress') {
      if (body.startDate !== item.startDate) {
        reject({
          message: 'La fecha de inicio no puede ser diferente a la del item',
        });
      }
      if (body.endDate !== item.endDate) {
        reject({
          message: 'La fecha de fin no puede ser diferente a la del item',
        });
      }
      if (moment(body.startDate).isAfter(moment(item.endDate))) {
        reject({
          message: 'La fecha de inicio tiene que ser menor a la de fin',
        });
      }
    }
  }

  deleteAllRequisitesOfTournament(tournamentId: string): Promise<TournamentI> {
    try {
      return Tournament.findByIdAndUpdate(
        tournamentId,
        { requisites: [] },
        { new: true }
      ).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteOne(id: string): Promise<TournamentI> {
    try {
      await this.roundService.deleteAllOfTournament(id);
      this.cacheService.deleteByCategory('tournament');
      return Tournament.findByIdAndDelete(id).exec();
    } catch (error) {
      return error;
    }
  }
}
