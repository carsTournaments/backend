import moment from 'moment';
import { InscriptionI, InscriptionService } from '@inscription';
import { RoundService, RoundI, RoundMongoI, roundsTypes, Round } from '@round';
import { PairingService, PairingMongoI, PairingI, Pairing } from '@pairing';
import { CarI } from '@car';
import {
  TournamentI,
  TournamentMongoI,
  Tournament,
  TournamentForceNextRoundDto,
} from '@tournament';
import { Winner } from '@winner';
import { IdSiteDto } from '@dtos';
import { Logger } from '@services';
import { CacheService } from '@cache';
import { MessageI } from '@interfaces';

export class TournamentHelper {
  private roundService = new RoundService();
  private pairingService = new PairingService();
  private inscriptionService = new InscriptionService();
  private cacheService = new CacheService();
  private roundsTypes = roundsTypes;
  private populateRoundsDefault = [
    {
      path: 'tournament',
      select: 'name',
      populate: { path: 'image', select: 'url' },
    },
    { path: 'votes', select: 'name' },
  ];
  private populatePauringsDefault = [
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
      populate: { path: 'images brand driver', select: 'url name' },
    },
    {
      path: 'car2',
      select: 'name model',
      populate: { path: 'images brand driver', select: 'url name' },
    },
    { path: 'votes', select: 'car' },
    {
      path: 'winner',
      select: 'name ',
      populate: { path: 'images brand', select: 'url name' },
    },
  ];

  async startTournament(tournamentId: string, cron = false): Promise<MessageI> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.roundService.deleteAllOfTournament(tournamentId);
        const tournament: TournamentMongoI = await this.getTournamentForStart(
          tournamentId
        );
        tournament.startDate = moment().format('YYYY-MM-DD HH:mm:ss');
        await tournament.save();
        if (tournament.inscriptions.length < tournament.maxParticipants) {
          await this.inscriptionService.forceInscriptions(tournamentId);
        }
        const roundsCreated =
          await this.createAutomaticsRoundsForStartTournament(
            tournamentId,
            cron
          );
        if (roundsCreated.length > 0) {
          this.cacheService.deleteByCategory('tournament');
          resolve({ message: `Torneo ${tournament.name} iniciado` });
        } else {
          resolve(null);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private async getTournamentForStart(
    tournamentId: string
  ): Promise<TournamentMongoI> {
    const tournament = await this.getTournament(tournamentId);
    return tournament;
  }

  private async getTournament(tournamentId: string): Promise<TournamentMongoI> {
    return Tournament.findById(tournamentId)
      .populate([
        {
          path: 'inscriptions',
          select: 'car',
        },
        { path: 'image', select: 'url' },
        { path: 'votes' },
      ])
      .populate('rounds')
      .exec();
  }

  private async createAutomaticsRoundsForStartTournament(
    id: string,
    cron: boolean
  ): Promise<RoundI[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const tournament: TournamentMongoI = await Tournament.findById(id)
          .populate('inscriptions')
          .exec();
        const totalRounds =
          roundsTypes.findIndex(
            (item) => item.participants === tournament.maxParticipants
          ) + 1;

        const totalParticipants = tournament.inscriptions.length;
        if (totalParticipants < tournament.maxParticipants && cron) {
          await this.createAutomaticsRoundsForStartTournamentWithCron(
            tournament,
            resolve
          );
        } else {
          await this.createAutomaticsRoundsForStartTournamentWithoutCron(
            totalParticipants,
            totalRounds,
            tournament,
            cron,
            reject,
            resolve
          );
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private async createAutomaticsRoundsForStartTournamentWithCron(
    tournament: TournamentMongoI,
    resolve: (value: RoundI[] | PromiseLike<RoundI[]>) => void
  ): Promise<void> {
    tournament.status = 'Todo';
    tournament.startDate = moment()
      .add(1, 'days')
      .format('YYYY-MM-DD HH:mm:ss');
    await tournament.save();
    resolve([]);
  }

  private async createAutomaticsRoundsForStartTournamentWithoutCron(
    totalParticipants: any,
    totalRounds: number,
    tournament: TournamentMongoI,
    cron: boolean,
    reject: (reason?: any) => void,
    resolve: (value: RoundI[] | PromiseLike<RoundI[]>) => void
  ) {
    const validations = this.createValidationsForCreateRounds(
      totalParticipants,
      totalRounds,
      tournament,
      cron
    );
    if (!validations.state) {
      reject({ message: validations.message });
    } else {
      await this.createRoundsOnValidationsSuccess(
        tournament,
        totalRounds,
        reject,
        tournament.inscriptions,
        resolve
      );
    }
  }

  private createValidationsForCreateRounds(
    totalParticipants: number,
    totalRounds: number,
    tournament: TournamentI,
    cron: boolean
  ): { state: boolean; message: string } {
    const validation = {
      state: true,
      message: '',
    };
    if (totalParticipants % 2 !== 0) {
      validation.state = false;
      validation.message = 'El número de participantes debe ser par';
    }
    // Comprobar numero de rondas
    if (totalRounds < 1) {
      validation.state = false;
      validation.message = 'El número de rondas debe ser mayor que 0';
    }
    // Comprobar numero de participantes

    if (!cron && totalParticipants < tournament.maxParticipants) {
      validation.state = false;
      validation.message =
        'El número de participantes debe ser igual al numero de participantes máximos del torneo';
    }
    return validation;
  }

  private async createRoundsOnValidationsSuccess(
    tournament: TournamentMongoI,
    totalRounds: number,
    reject: (reason?: any) => void,
    inscriptions: InscriptionI[],
    resolve: (value: RoundI[] | PromiseLike<RoundI[]>) => void
  ) {
    try {
      const daysBetweenRounds = tournament.durationDays / totalRounds;
      const roundsCreated: RoundMongoI[] =
        await this.createRoundsForStartTournament(
          tournament,
          totalRounds,
          daysBetweenRounds,
          inscriptions
        );
      resolve(roundsCreated);
    } catch (error) {
      reject(error);
    }
  }

  private async createRoundsForStartTournament(
    tournament: TournamentMongoI,
    totalRounds: number,
    daysBetweenRounds: number,
    inscriptions: InscriptionI[]
  ): Promise<RoundMongoI[]> {
    try {
      const roundsCreated: RoundMongoI[] = [];
      for (let i = 0; i < totalRounds; i++) {
        const { roundType, startDate, endDate } = this.getDataForCreateRounds(
          totalRounds,
          i,
          tournament,
          daysBetweenRounds
        );
        const round: RoundMongoI = new Round({
          name: roundType.name,
          participants: roundType.participants,
          tournament: tournament._id,
          startDate: i === 0 ? moment().format('YYYY-MM-DD HH:mm') : startDate,
          endDate,
          status: i === 0 ? 'InProgress' : 'Todo',
        });
        await round.save();
        roundsCreated.push(round);

        // si es la primera ronda creamos emparejamientos
        if (i === 0) {
          tournament.startDate = startDate;
          tournament.status = 'InProgress';
          await this.createPairingsForRound(
            round._id,
            tournament._id,
            inscriptions,
            roundType.participants / 2
          );
        }
        if (i === totalRounds - 1) {
          tournament.endDate = endDate;
        }
        await tournament.save();
      }
      return roundsCreated;
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  private getDataForCreateRounds(
    totalRounds: number,
    i: number,
    tournament: TournamentMongoI,
    daysBetweenRounds: number
  ): { roundType: any; startDate: string; endDate: string } {
    try {
      const roundType = this.roundsTypes[totalRounds - i - 1];
      // si daysBetweenRounds es menor que 1, el valor se tiene que dividir en 24 horas
      const durationsHours = tournament.durationDays * 24;
      const daysOrMinutesValueStart =
        daysBetweenRounds < 1
          ? (durationsHours / totalRounds) * i
          : daysBetweenRounds * i;
      const daysOrMinutesValueEnd =
        daysBetweenRounds < 1
          ? durationsHours / totalRounds
          : daysBetweenRounds;
      const daysOrMinutesType = daysBetweenRounds < 1 ? 'hours' : 'days';
      const startDate = moment(tournament.startDate)
        .add(daysOrMinutesValueStart, daysOrMinutesType)
        .format('YYYY-MM-DD HH:mm');
      const endDate = moment(startDate)
        .add(daysOrMinutesValueEnd, daysOrMinutesType)
        .format('YYYY-MM-DD HH:mm');
      return { roundType, startDate, endDate };
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  private async createPairingsForRound(
    roundId: string,
    tournamentId: string,
    inscriptions: InscriptionI[],
    totalPairings: number
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < totalPairings; i++) {
          const response1 = await this.generateCarsForRound(inscriptions);
          inscriptions = response1.inscriptions;
          const response2 = await this.generateCarsForRound(
            response1.inscriptions
          );
          inscriptions = response2.inscriptions;
          if (response1 && response2) {
            const body: PairingI | any = {
              round: roundId,
              tournament: tournamentId,
              winner: null,
              car1: response1.car,
              car2: response2.car,
            };
            await this.pairingService.create(body);
          } else {
            resolve(false);
          }
        }
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async generateCarsForRound(inscriptions: InscriptionI[]): Promise<{
    inscriptions: InscriptionI[];
    car: string;
  }> {
    return new Promise((resolve, reject) => {
      try {
        let randomNumber: number;
        let car: string;
        if (inscriptions.length > 1) {
          randomNumber = Math.floor(Math.random() * inscriptions.length);
          car = inscriptions[randomNumber].car._id.toString();
        } else if (inscriptions.length === 1) {
          randomNumber = 0;
          car = inscriptions[0].car._id.toString();
        } else {
          reject({ message: 'Una inscripcion no es valida' });
        }
        inscriptions = inscriptions.filter(
          (inscription) => inscription.car._id.toString() !== car
        );
        resolve({ inscriptions, car });
      } catch (error) {
        reject(error);
      }
    });
  }

  async forceNextRound(body: TournamentForceNextRoundDto): Promise<MessageI> {
    return new Promise(async (resolve, reject) => {
      try {
        const query = { id: body.tournamentId, site: 'admin' };
        const rounds: RoundMongoI[] = await this.getAllRoundsOfTournament(
          query
        );
        const tournament: TournamentMongoI = await Tournament.findById(
          body.tournamentId
        ).exec();
        if (tournament) {
          if (tournament.status !== 'Completed') {
            await this.tournamentIsNotCompletedForNextRound(
              rounds,
              tournament,
              resolve,
              reject
            );
            this.cacheService.deleteByCategory('tournament');
          } else {
            reject({ message: 'El torneo ya esta finalizado' });
          }
        } else {
          reject({ message: 'El torneo no existe' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private async getAllRoundsOfTournament(
    data: IdSiteDto
  ): Promise<RoundMongoI[]> {
    try {
      const items: RoundMongoI[] = await Round.find({
        tournament: data.id,
      })
        .populate(this.populateRoundsDefault)
        .exec();
      return items;
    } catch (error) {
      return error;
    }
  }

  private async tournamentIsNotCompletedForNextRound(
    rounds: RoundMongoI[],
    tournament: TournamentMongoI,
    resolve: (value: MessageI | PromiseLike<MessageI>) => void,
    reject: (reason?: any) => void
  ) {
    if (rounds.length > 0) {
      if (!this.checkAllRoundCompleted(rounds)) {
        const roundInProgress = rounds.find((r) => r.status === 'InProgress');
        const nextRound = rounds.find((r) => r.status === 'Todo');
        if (roundInProgress && nextRound) {
          await this.isNotFinalRound(roundInProgress, nextRound);
        } else if (roundInProgress && !nextRound) {
          await this.isFinalRound(roundInProgress);
          resolve({ message: 'Torneo finalizado' });
        }
      } else {
        tournament.endDate = moment().format('YYYY-MM-DD HH:mm');
        tournament.status = 'Completed';
        await tournament.save();
        reject({
          message: 'Todas las rondas ya han sido completadas',
        });
      }
      resolve({ message: 'Ronda forzada correctamente' });
    } else {
      reject({ message: 'No se encontraron rondas' });
    }
  }

  private checkAllRoundCompleted(rounds: RoundI[]): boolean {
    return rounds.every((r) => r.status === 'Completed');
  }

  private isNotFinalRound(
    roundInProgress: RoundMongoI,
    nextRound: RoundMongoI
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const carsForNewParings = await this.checkAndSetWinnersOfRound(
          roundInProgress,
          false
        );
        if (carsForNewParings.length > 0) {
          roundInProgress.status = 'Completed';
          roundInProgress.endDate = moment().format('YYYY-MM-DD HH:mm');
          await roundInProgress.save();
          nextRound.startDate = moment().format('YYYY-MM-DD HH:mm');
          nextRound.status = 'InProgress';
          await nextRound.save();
          const state = await this.createPairingsForRound(
            nextRound._id,
            nextRound.tournament,
            carsForNewParings,
            carsForNewParings.length / 2
          );
          if (state) {
            resolve();
          } else {
            reject({ message: 'Error al crear emparejamientos' });
          }
        } else {
          reject({ message: 'No hay participantes para la ronda' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private async isFinalRound(roundInProgress: RoundMongoI): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await this.checkAndSetWinnersOfRound(
          roundInProgress,
          true
        );
        const gold = response.gold;
        const silver = response.silver;
        const bronze = await this.getBronzeWinner(
          roundInProgress.tournament._id,
          gold,
          silver
        );
        roundInProgress.endDate = moment().format('YYYY-MM-DD HH:mm');
        roundInProgress.status = 'Completed';
        await roundInProgress.save();
        await this.completeTournamentAndSetWinners(
          gold,
          silver,
          bronze,
          roundInProgress
        );
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async completeTournamentAndSetWinners(
    gold: CarI,
    silver: CarI,
    bronze: CarI,
    round: RoundI
  ): Promise<void> {
    const tournament: TournamentMongoI = await Tournament.findById(
      round.tournament._id
    ).exec();
    tournament.endDate = moment().format('YYYY-MM-DD HH:mm');
    tournament.status = 'Completed';
    await tournament.save();
    const winnerItem = new Winner({
      gold: gold._id,
      silver: silver._id,
      bronze: bronze._id,
      tournament: round.tournament._id,
    });
    await winnerItem.save();
  }

  private async getBronzeWinner(
    tournamentId: string,
    gold: CarI,
    silver: CarI
  ): Promise<CarI> {
    return new Promise(async (resolve, reject) => {
      try {
        if (gold && gold._id && silver && silver._id) {
          const semifinalRound: RoundI = await this.getSemifinalRounds(
            tournamentId
          );
          const items: { car: CarI; votes: number }[] = [];
          if (semifinalRound) {
            for (const pairing of semifinalRound.pairings) {
              const item: PairingI = await Pairing.findOne({
                round: pairing.round._id.toString(),
                winner: { $ne: null },
              })
                .populate(this.populatePauringsDefault)
                .exec();
              const car1 = item.car1;
              const car2 = item.car2;
              if (
                car1?._id.toString() !== gold?._id.toString() &&
                car1?._id.toString() !== silver?._id.toString()
              ) {
                items.push({
                  car: car1,
                  votes: item.votes.length,
                });
              } else {
                items.push({
                  car: car2,
                  votes: item.votes.length,
                });
              }
            }
            const bronze = items.reduce((a, b) => (a.votes > b.votes ? a : b));
            resolve(bronze.car);
          } else {
            reject({
              message: 'No se encontro el round de semifinal',
            });
          }
        } else {
          reject({ message: 'Los coches no son validos' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  private async getSemifinalRounds(tournamentId: string): Promise<RoundI> {
    return Round.findOne({
      tournament: tournamentId.toString(),
      name: 'Semifinal',
    })
      .populate({ path: 'pairings' })
      .exec();
  }

  private async checkAndSetWinnersOfRound(
    round: RoundI,
    final = false
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const pairings: PairingMongoI[] =
          await this.pairingService.getAllRoundPairings(round._id);
        // count votes of pairings
        let inscriptions: InscriptionI[] = [];
        let gold: CarI;
        let silver: CarI;
        for (const pairing of pairings) {
          if (
            pairing.car1 &&
            pairing.car1._id &&
            pairing.car2 &&
            pairing.car2._id
          ) {
            ({ inscriptions, gold, silver } =
              await this.thereAreParticipantOfCheckAndSetWinnersOfRound(
                pairing,
                inscriptions,
                round,
                final,
                gold,
                silver,
                reject
              ));
          } else {
            reject({
              message: 'No hay participantes para la ronda',
            });
          }
        }
        resolve(!final ? inscriptions : { gold, silver });
      } catch (error) {
        reject(error);
      }
    });
  }

  private async thereAreParticipantOfCheckAndSetWinnersOfRound(
    pairing: PairingMongoI,
    inscriptions: InscriptionI[],
    round: RoundI,
    final: boolean,
    gold: CarI,
    silver: CarI,
    reject: any
  ) {
    const { votesCar1, votesCar2 } = this.votesCar(pairing, reject);
    if (inscriptions) {
      if (votesCar1 > votesCar2 || votesCar1 < votesCar2) {
        const type = votesCar1 > votesCar2 ? 'car1' : 'car2';
        const results = await this.carGreaterThanCar(
          type,
          pairing,
          inscriptions,
          round,
          final,
        );
        if (results.gold && results.silver) {
          gold = results.gold;
          silver = results.silver;
        } else {
          inscriptions = results;
        }
      } else {
        const result = await this.checkAndSetWinnersOfRoundRandom(
          pairing,
          inscriptions,
          round,
          final
        );
        if (final) {
          gold = result.gold;
          silver = result.silver;
        } else {
          inscriptions = result;
        }
      }
    } else {
      reject({ message: 'No hay inscripciones' });
    }
    return { inscriptions, gold, silver };
  }

  private votesCar(
    pairing: PairingMongoI,
    reject: (reason?: any) => void
  ): { votesCar1: number; votesCar2: number } {
    let votesCar1 = 0;
    let votesCar2 = 0;
    for (const vote of pairing.votes) {
      if (vote.car && vote.car._id) {
        if (vote.car._id.toString() === pairing.car1._id.toString()) {
          votesCar1++;
        } else {
          votesCar2++;
        }
      } else {
        reject({
          message: 'No existe el coche del voto',
        });
      }
    }
    return { votesCar1, votesCar2 };
  }

  private async carGreaterThanCar(
    type: 'car1' | 'car2',
    pairing: PairingMongoI,
    inscriptions: InscriptionI[],
    round: RoundI,
    final: boolean
  ): Promise<any> {
    try {
      let gold: CarI;
      let silver: CarI;
      pairing.winner = pairing[type]._id;
      await pairing.save();
      const inscription: InscriptionI = {
        car: pairing[type]._id,
        tournament: round.tournament._id,
        driver:
          pairing[type].driver && pairing[type].driver._id
            ? pairing[type].driver._id
            : pairing[type].driver,
      };
      inscriptions.push(inscription);
      if (final) {
        gold = pairing[type];
        silver = pairing[type === 'car1' ? 'car2' : 'car1'];
      }
      return !final ? inscriptions : { gold, silver };
    } catch (error) {
      return error;
    }
  }

  private async checkAndSetWinnersOfRoundRandom(
    pairing: PairingMongoI,
    inscriptions: InscriptionI[],
    round: RoundI,
    final = false
  ): Promise<any> {
    try {
      // empate resolver aleatoriamente
      const randomNumber = Math.floor(Math.random() * 2);
      const silver = await this.checkAndSetWinnersOfRoundRandomByType(
        randomNumber,
        pairing,
        inscriptions,
        round,
        final
      );

      return !final ? inscriptions : { gold: inscriptions[0].car, silver };
    } catch (error) {
      return error;
    }
  }

  private async checkAndSetWinnersOfRoundRandomByType(
    type: number,
    pairing: PairingMongoI,
    inscriptions: InscriptionI[],
    round: RoundI,
    final: boolean
  ) {
    let silver: CarI;
    const winnerCar = type === 0 ? pairing.car1 : pairing.car2;
    const loserCar = type === 0 ? pairing.car2 : pairing.car1;
    pairing.winner = winnerCar._id;
    await pairing.save();
    inscriptions.push({
      car: winnerCar._id,
      tournament: round.tournament._id,
      driver: winnerCar.driver,
    });
    if (final) {
      silver = loserCar;
    }
    return silver;
  }
}
