import { Router, NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions';
import { IdDto } from '@dtos';
import { validationMiddleware, checkAdminToken } from '@middlewares';
import { ControllerI } from '@interfaces';
import {
  VoteI,
  VoteService,
  VoteGetAllDto,
  VoteGetAllOfGenericDto,
  VoteCreateDto,
  VoteCreateFakeVotesDto,
} from '@vote';

export class VoteController implements ControllerI {
  path = '/votes';
  router = Router();
  private voteService = new VoteService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getAll`,
      validationMiddleware(VoteGetAllDto),
      this.getAll
    );
    this.router.post(
      `${this.path}/getAllCarVotes`,
      validationMiddleware(VoteGetAllOfGenericDto),
      this.getAllCarVotes
    );
    this.router.post(
      `${this.path}/getAllTournamentVotes`,
      validationMiddleware(VoteGetAllOfGenericDto),
      this.getAllTournamentVotes
    );
    this.router.post(
      `${this.path}/getOne`,
      validationMiddleware(IdDto),
      this.getOne
    );
    this.router.post(
      `${this.path}/create`,
      validationMiddleware(VoteCreateDto),
      this.create
    );
    this.router.post(
      `${this.path}/createFakeVotes`,
      [validationMiddleware(VoteCreateFakeVotesDto), checkAdminToken],
      this.createFakeVotes
    );
    this.router.delete(
      `${this.path}/cleanVotes`,
      checkAdminToken,
      this.cleanVotes
    );
    this.router.delete(`${this.path}/one/:id`, checkAdminToken, this.deleteOne);
    this.router.delete(`${this.path}/all`, checkAdminToken, this.deleteAll);
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: VoteGetAllDto = request.body;
      const items = await this.voteService.getAll(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllCarVotes = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: VoteGetAllOfGenericDto = request.body;
      const items = await this.voteService.getAllCarVotes(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllTournamentVotes = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: VoteGetAllOfGenericDto = request.body;
      const items = await this.voteService.getAllTournamentVotes(body);
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
      const item: VoteI = await this.voteService.getOne(id);
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
      const body: VoteCreateDto = request.body;
      const item = await this.voteService.create(body);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private createFakeVotes = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: VoteCreateFakeVotesDto = request.body;
      const item = await this.voteService.createFakeVotes(body);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private cleanVotes = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.voteService.cleanVotes();
      response.status(200).send(result);
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
      const item = await this.voteService.deleteOne(id);
      const message = item ? `Voto ${id} eliminado` : `Voto ${id} no existe`;
      response.status(200).send({ message });
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      await this.voteService.deleteAll();
      response.status(200).send({ message: 'Todos los votos eliminados' });
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
