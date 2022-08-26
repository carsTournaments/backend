import { Logger } from '@services';
import { Round } from '@round';
import { TournamentHelper, TournamentI, Tournament } from '@tournament';
import moment from 'moment';
import * as schedule from 'node-schedule';
import { CrontabI, StartCronDto } from './crontab.interface';

export class CrontabService {
  private tournamentHelper = new TournamentHelper();
  items: CrontabI[] = [];

  async generateAutomaticsCrons(): Promise<void> {
    try {
      this.items = [];
      await schedule.gracefulShutdown();
      const { tournamentsTodo, tournamentsInProgress } =
        await this.getTournamentsTodosAndInProgress();
      this.setCronsForTournamentsTodo(tournamentsTodo);
      await this.setCronsForRounds(tournamentsInProgress);
      this.orderCronsByDate();
      this.generateLogsForInit();
    } catch (error) {
      Logger.error(error);
    }
  }

  private async getTournamentsTodosAndInProgress(): Promise<{
    tournamentsTodo: TournamentI[];
    tournamentsInProgress: TournamentI[];
  }> {
    const tournaments = await Tournament.find({
      status: { $in: ['Todo', 'InProgress'] },
    }).exec();
    const tournamentsTodo: TournamentI[] = tournaments.filter(
      (tournament) => tournament.status === 'Todo'
    );
    const tournamentsInProgress: TournamentI[] = tournaments.filter(
      (tournament) => tournament.status === 'InProgress'
    );
    return { tournamentsTodo, tournamentsInProgress };
  }

  private setCronsForTournamentsTodo(
    tournaments: TournamentI[]
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        for (const tournament of tournaments) {
          const actionCronForTournament = async () => {
            try {
              Logger.info('[CRON] Inicio de torneo' + tournament.name);
              const tournamentItem = await Tournament.findById(
                tournament._id
              ).exec();
              const result = await this.tournamentHelper.startTournament(
                tournament._id,
                true
              );
              if (result == null) {
                Logger.warn(
                  `[CRON] El torneo ${tournamentItem.name} se ha aplazado 1 día`
                );
              } else {
                await this.createCronForRound(tournamentItem);
              }
            } catch (error) {
              return error;
            }
          };
          let cronExpression: Date;
          // comprobamos que startDate no sea anterior a la fecha actual
          if (moment(tournament.startDate).unix() > moment().unix()) {
            cronExpression = new Date(tournament.startDate);
          } else {
            Logger.warn(
              '[CRON] Torneo con fecha anterior a la actual, iniciamos en 1 minuto'
            );
            cronExpression = new Date(
              moment().add(1, 'minutes').format('YYYY-MM-DD HH:mm')
            );
          }
          this.createCronOfTournament(
            tournament,
            cronExpression,
            actionCronForTournament
          );
          resolve();
        }
      } catch (error) {
        Logger.error(error);
        reject(error);
      }
    });
  }

  private createCronOfTournament(
    tournament: TournamentI,
    cronExpression: Date,
    action: any
  ): void {
    // start
    this.startCron({
      type: 'tournament',
      id: tournament._id,
      cronExpression,
      action,
      date: tournament.startDate,
    });
  }

  private async setCronsForRounds(tournamentsInProgress: any): Promise<void> {
    try {
      for (const tournament of tournamentsInProgress) {
        await this.createCronForRound(tournament);
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  private async createCronForRound(tournament: TournamentI): Promise<void> {
    try {
      // el forzado de inicio tiene que programar un cron en la primera ronda
      const round = await Round.findOne({
        tournament: tournament._id,
        status: 'InProgress',
      }).exec();
      if (round) {
        const cronExpression = new Date(round.endDate);
        const action = async () => {
          Logger.info(
            '[CRON] Inicio de ronda' + tournament.name + ' - ' + round.name
          );
          const roundItem = await Round.findById(round._id).exec();
          roundItem.status = 'InProgress';
          roundItem.save();
          // Forzar inicio de ronda
          this.tournamentHelper
            .forceNextRound({ tournamentId: tournament._id })
            .then(() => {
              this.generateAutomaticsCrons();
            })
            .catch((error) =>
              Logger.error('Error al forzar inicio de ronda', error)
            );
        };

        this.startCron({
          type: 'round',
          id: round._id,
          cronExpression,
          action,
          date: round.startDate,
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  private startCron(data: StartCronDto): void {
    const cron: schedule.Job = schedule.scheduleJob(
      data.cronExpression,
      data.action
    );
    const item = {
      type: data.type,
      cron,
      id: data.id,
      start: true,
      date: data.date,
    };
    this.items.push(item);
  }

  private orderCronsByDate(): void {
    this.items.sort((a, b) => {
      if (a.date < b.date) {
        return -1;
      }
      if (a.date > b.date) {
        return 1;
      }
      return 0;
    });
  }

  private generateLogsForInit(): void {
    const tournamentsCron = this.items.filter((i) => i.type === 'tournament');
    Logger.info(
      `[CRON] ${tournamentsCron.length} torneos - Proximo: ${
        tournamentsCron.length > 0
          ? moment(tournamentsCron[0].date).format('DD-MM-YYYY HH:mm')
          : 'No hay torneos'
      }`
    );
    Logger.info(
      `[CRON] ${
        this.items.filter((i) => i.type === 'round').length
      } rondas - Proximo: ${
        this.items.filter((i) => i.type === 'round').length > 0
          ? moment(this.items.filter((i) => i.type === 'round')[0].date).format(
              'DD-MM-YYYY HH:mm'
            )
          : 'No hay rondas'
      }`
    );
  }
}
