import { NextFunction, Request, Response, Router } from 'express';
import {
  TournamentCreateDto,
  TournamentForceNextRoundDto,
  TournamentGetAllDto,
  TournamentI,
  TournamentService,
  TournamentUpdateDto,
} from '@tournament';
import { ControllerI, MessageI } from '@interfaces';
import { HttpException } from '@exceptions';
import { IdDto } from '@dtos';
import {
  validationMiddleware,
  checkAdminToken,
  verifyCache,
} from '@middlewares';

export class TournamentController implements ControllerI {
  path = '/Tournaments';
  router = Router();
  private tournamentService = new TournamentService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getAll`,
      validationMiddleware(TournamentGetAllDto),
      this.getAll
    );
    this.router.post(
      `${this.path}/getAllOfAllStates`,
      [verifyCache('tournament.getAllOfAllStates')],
      this.getAllOfAllStates
    );
    this.router.post(
      `${this.path}/getDaysForCalendar`,
      [verifyCache('tournament.getDaysForCalendar')],
      this.getDaysForCalendar
    );
    this.router.post(`${this.path}/getCalendarItems`, this.getCalendarItems);
    this.router.post(`${this.path}/getOne`, this.getOne);
    this.router.post(
      `${this.path}/create`,
      validationMiddleware(TournamentCreateDto),
      checkAdminToken,
      this.create
    );
    this.router.post(
      `${this.path}/startTournament`,
      validationMiddleware(IdDto),
      checkAdminToken,
      this.startTournament
    );
    this.router.post(
      `${this.path}/resetTournament`,
      validationMiddleware(IdDto),
      checkAdminToken,
      this.resetTournament
    );
    this.router.post(
      `${this.path}/cancelTournament`,
      validationMiddleware(IdDto),
      checkAdminToken,
      this.cancelTournament
    );
    this.router.post(
      `${this.path}/forceNextRound`,
      validationMiddleware(TournamentForceNextRoundDto),
      checkAdminToken,
      this.forceNextRound
    );
    this.router.put(
      `${this.path}/update`,
      validationMiddleware(TournamentUpdateDto),
      checkAdminToken,
      this.update
    );
    this.router.delete(
      `${this.path}/allRequisitesOfTournament/:id`,
      checkAdminToken,
      this.deleteAllRequisitesOfTournament
    );
    this.router.delete(`${this.path}/one/:id`, checkAdminToken, this.deleteOne);
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: TournamentGetAllDto = request.body;
      const result = await this.tournamentService.getAll(body);
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllOfAllStates = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.tournamentService.getAllOfAllStates();
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getDaysForCalendar = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.tournamentService.getDaysForCalendar();
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getCalendarItems = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body = request.body;
      const result = await this.tournamentService.getCalendarItems(body.date);
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getOne = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const id = request.body.id;
      const item: TournamentI = await this.tournamentService.getOne(id);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private create = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: TournamentCreateDto = request.body;
      const newItem: TournamentI = await this.tournamentService.create(body);
      response.status(200).send(newItem);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private startTournament = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const item: MessageI = await this.tournamentService.startTournament(
        body.id
      );
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private resetTournament = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const item: TournamentI = await this.tournamentService.resetTournament(
        body.id
      );
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private cancelTournament = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const item: TournamentI = await this.tournamentService.cancelTournament(
        body.id
      );
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private forceNextRound = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: TournamentForceNextRoundDto = request.body;
      const item: MessageI = await this.tournamentService.forceNextRound(body);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private update = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: TournamentUpdateDto = request.body;
      const item = await this.tournamentService.update(body);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteAllRequisitesOfTournament = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const id: string = request.params.id;
      await this.tournamentService.deleteAllRequisitesOfTournament(id);
      response
        .status(200)
        .send({ message: `Requisitos del torneo ${id} eliminados` });
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteOne = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const id = request.params.id;
      const item = await this.tournamentService.deleteOne(id);
      const message = item
        ? `Torneo ${id} eliminado`
        : `Torneo ${id} no existe`;
      response.status(200).send({ message });
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
