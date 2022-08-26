import { HttpException } from '@exceptions';
import { GetAllDto, IdDto } from '@dtos';
import { ControllerI } from '@interfaces';
import { validationMiddleware, checkAdminToken } from '@middlewares';
import { NextFunction, Request, Response, Router } from 'express';
import {
  WinnerCreateDto,
  WinnerI,
  WinnerService,
  WinnerUpdateDto,
} from '@winner';

export class WinnerController implements ControllerI {
  path = '/winners';
  router = Router();
  private winnerService = new WinnerService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getAll`,
      [validationMiddleware(GetAllDto), checkAdminToken],
      this.getAll
    );
    this.router.post(
      `${this.path}/getAllTournamentWinners`,
      validationMiddleware(IdDto),
      checkAdminToken,
      this.getAllTournamentWinners
    );
    this.router.post(
      `${this.path}/getAllCarWinners`,
      validationMiddleware(IdDto),
      this.getAllCarWinners
    );
    this.router.post(
      `${this.path}/getAllUserWinners`,
      validationMiddleware(IdDto),
      this.getAllUserWinners
    );
    this.router.post(
      `${this.path}/forTournament`,
      validationMiddleware(IdDto),
      this.getForTournament
    );
    this.router.post(
      `${this.path}/forTournamentComplete`,
      validationMiddleware(IdDto),
      this.getForTournamentComplete
    );
    this.router.post(`${this.path}/one`, checkAdminToken, this.getOne);
    this.router.post(
      `${this.path}/create`,
      validationMiddleware(WinnerCreateDto),
      checkAdminToken,
      this.create
    );
    this.router.put(
      `${this.path}/update`,
      validationMiddleware(WinnerUpdateDto),
      checkAdminToken,
      this.update
    );
    this.router.delete(`${this.path}/one/:id`, checkAdminToken, this.deleteOne);
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: GetAllDto = request.body;
      const items = await this.winnerService.getAll(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllTournamentWinners = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const item = await this.winnerService.getAllTournamentWinners(body.id);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllCarWinners = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const items = await this.winnerService.getAllCarWinners(body.id);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllUserWinners = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const items = await this.winnerService.getAllUserWinners(body.id);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getForTournament = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const items = await this.winnerService.getForTournament(body.id);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getForTournamentComplete = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const items = await this.winnerService.getForTournamentComplete(body.id);
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
      const item: WinnerI = await this.winnerService.getOne(id);
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
      const body: WinnerCreateDto = request.body;
      const newItem: WinnerI = await this.winnerService.create(body);
      response.status(200).send(newItem);
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
      const body: WinnerUpdateDto = request.body;
      const item = await this.winnerService.update(body);
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
      const item = await this.winnerService.deleteOne(id);
      const message = item
        ? `Torneo ${id} eliminado`
        : `Torneo ${id} no existe`;
      response.status(200).send({ message });
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
