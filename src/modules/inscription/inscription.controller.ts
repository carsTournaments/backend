import { NextFunction, Request, Response, Router } from 'express';
import {
  InscriptionCreateDto,
  InscriptionGetAllOfCarDto,
  InscriptionGetMyCarsForInscriptionDto,
  InscriptionI,
  InscriptionService,
} from '@inscription';
import { ControllerI, RequestExtendedI } from '@interfaces';
import { HttpException } from '@exceptions';
import { GetAllDto, IdSiteDto, IdDto } from '@dtos';
import {
  validationMiddleware,
  checkAdminToken,
  checkUserNotObligatory,
  checkUserToken,
} from '@middlewares';

export class InscriptionController implements ControllerI {
  path = '/inscriptions';
  router = Router();
  private inscriptionService = new InscriptionService();
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
      `${this.path}/getAllTournamentInscriptions`,
      [validationMiddleware(IdSiteDto), checkUserNotObligatory],
      this.getAllTournamentInscriptions
    );
    this.router.post(
      `${this.path}/getAllCarInscriptions`,
      [validationMiddleware(InscriptionGetAllOfCarDto)],
      this.getAllCarInscriptions
    );
    this.router.post(
      `${this.path}/getAllDriverInscriptions`,
      [validationMiddleware(IdDto), checkUserToken],
      this.getAllDriverInscriptions
    );
    this.router.post(
      `${this.path}/getMyCarsForInscription`,
      [
        validationMiddleware(InscriptionGetMyCarsForInscriptionDto),
        checkUserToken,
      ],
      this.getMyCarsForInscription
    );
    this.router.post(
      `${this.path}/getOne`,
      validationMiddleware(IdDto),
      this.getOne
    );
    this.router.post(
      `${this.path}/create`,
      validationMiddleware(InscriptionCreateDto),
      checkUserToken,
      this.create
    );
    this.router.post(
      `${this.path}/forceInscriptions`,
      validationMiddleware(IdDto),
      checkAdminToken,
      this.forceInscriptions
    );
    this.router.delete(
      `${this.path}/allOfTournament/:id`,
      checkAdminToken,
      this.deleteAllOfTournament
    );
    this.router.delete(`${this.path}/one/:id`, checkAdminToken, this.deleteOne);
    this.router.delete(
      `${this.path}/oneByCarAndTournament/:carId/:tournamentId`,
      checkUserToken,
      this.deleteByCarAndTournament
    );
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: GetAllDto = request.body;
      const items = await this.inscriptionService.getAll(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllTournamentInscriptions = async (
    request: RequestExtendedI,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdSiteDto = request.body;
      const items: InscriptionI[] =
        await this.inscriptionService.getAllTournamentInscriptions(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllCarInscriptions = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: InscriptionGetAllOfCarDto = request.body;
      const items: InscriptionI[] =
        await this.inscriptionService.getAllCarInscriptions(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllDriverInscriptions = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const items: any = await this.inscriptionService.getAllDriverInscriptions(
        body.id
      );
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getMyCarsForInscription = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: InscriptionGetMyCarsForInscriptionDto = request.body;
      const items: any = await this.inscriptionService.getMyCarsForInscription(
        body
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
      const body: IdDto = request.body;
      const item: InscriptionI = await this.inscriptionService.getOne(body.id);
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
      const body: InscriptionCreateDto = request.body;
      const item = await this.inscriptionService.create(body);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private forceInscriptions = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const item = await this.inscriptionService.forceInscriptions(body.id);
      response.status(200).send(item);
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
      await this.inscriptionService.deleteAllOfTournament(id);
      response.status(200).send({ message: 'Inscripciones eliminadas' });
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
      const item = await this.inscriptionService.deleteOne(id);
      const message = item
        ? `Inscription ${id} eliminada`
        : `Inscription ${id} no existe`;
      response.status(200).send({ message });
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteByCarAndTournament = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const carId = request.params.carId;
      const tournamentId = request.params.tournamentId;
      const item = await this.inscriptionService.deleteByCarAndTournament(
        carId,
        tournamentId
      );
      const message = item ? `Inscription eliminada` : `Inscription no existe`;
      response.status(200).send({ message });
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
