import { NextFunction, Request, Response, Router } from 'express';
import { ControllerI, RequestExtendedI } from '@interfaces';
import { GetAllDto, IdSiteDto } from '@dtos';
import { RoundService, RoundUpdateDto, RoundI } from '@round';
import {
  validationMiddleware,
  checkAdminToken,
  checkUserNotObligatory,
} from '@middlewares';
import { HttpException } from '@exceptions';

export class RoundController implements ControllerI {
  path = '/rounds';
  router = Router();
  private roundService = new RoundService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getAll`,
      validationMiddleware(GetAllDto),
      this.getAll
    );
    this.router.post(
      `${this.path}/getAllTournamentRounds`,
      [validationMiddleware(IdSiteDto), checkUserNotObligatory],
      this.getAllTournamentRounds
    );
    this.router.post(`${this.path}/one`, this.getOne);
    this.router.put(
      `${this.path}/update`,
      validationMiddleware(RoundUpdateDto),
      checkAdminToken,
      this.update
    );
    this.router.delete(`${this.path}/one/:id`, checkAdminToken, this.deleteOne);
    this.router.delete(
      `${this.path}/allOfTournament/:id`,
      checkAdminToken,
      this.deleteAllOfTournament
    );
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: GetAllDto = request.body;
      const items = await this.roundService.getAll(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllTournamentRounds = async (
    request: RequestExtendedI,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdSiteDto = request.body;
      const items: RoundI[] = await this.roundService.getAllTournamentRounds(
        body,
        request?.user
      );
      response.status(200).send(items);
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
      const item: RoundI = await this.roundService.getOne(id);
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
      const body: RoundUpdateDto = request.body;
      const item = await this.roundService.update(body);
      response.status(200).send(item);
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
      const item = await this.roundService.deleteOne(id);
      const message = item ? `Ronda ${id} eliminada` : `Ronda ${id} no existe`;
      response.status(200).send({ message });
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteAllOfTournament = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const id = request.params.id;
      const items = await this.roundService.deleteAllOfTournament(id);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
