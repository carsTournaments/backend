import { NextFunction, Request, Response, Router } from 'express';
import { HttpException } from '@exceptions';
import { GetAllDto, IdDto, IdSiteDto } from '@dtos';
import { ControllerI, RequestExtendedI } from '@interfaces';
import {
  validationMiddleware,
  checkAdminToken,
  checkUserNotObligatory,
} from '@middlewares';
import { PairingService, PairingI, PairingUpdateDto } from '@pairing';

export class PairingController implements ControllerI {
  path = '/pairings';
  router = Router();
  private pairingService = new PairingService();
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
      `${this.path}/getAllTournamentPairings`,
      validationMiddleware(IdDto),
      this.getAllTournamentPairings
    );
    this.router.post(
      `${this.path}/one`,
      validationMiddleware(IdSiteDto),
      checkUserNotObligatory,
      this.getOne
    );
    this.router.put(
      `${this.path}/update`,
      [validationMiddleware(PairingUpdateDto), checkAdminToken],
      this.update
    );
    this.router.delete(`${this.path}/one/:id`, checkAdminToken, this.deleteOne);
    this.router.delete(
      `${this.path}/all`,
      checkAdminToken,
      this.deleteAllPairings
    );
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: GetAllDto = request.body;
      const items = await this.pairingService.getAll(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllTournamentPairings = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const items: PairingI[] =
        await this.pairingService.getAllTournamentPairings(body.id);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getOne = async (
    request: RequestExtendedI,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdSiteDto = request.body;
      const user = request.user;
      const item: PairingI = await this.pairingService.getOne(body, user);
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
      const body: PairingUpdateDto = request.body;
      const item = await this.pairingService.update(body);
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
      const item = await this.pairingService.deleteOne(id);
      const message = item
        ? `Emparejamiento ${id} eliminado`
        : `Emparejamiento ${id} no existe`;
      response.status(200).send({ message });
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteAllPairings = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.pairingService.deleteAllPairings();
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
