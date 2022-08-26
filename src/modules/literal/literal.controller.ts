import { NextFunction, Request, Response, Router } from 'express';
import { GetAllDto } from '@dtos';
import { ControllerI } from '@interfaces';
import {
  validationMiddleware,
  checkAdminToken,
  verifyCache,
} from '@middlewares';
import {
  LiteralService,
  LiteralI,
  LiteralCreateDto,
  LiteralUpdateDto,
} from '@literal';
import { HttpException } from '@core/exceptions';

export class LiteralController implements ControllerI {
  path = '/literals';
  router = Router();
  private literalService = new LiteralService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getAll`,
      [validationMiddleware(GetAllDto), checkAdminToken],
      this.getAll
    );
    this.router.get(
      `${this.path}/:language`,
      [verifyCache('literal.getAllForLanguage')],
      this.getAllForLanguage
    );
    this.router.post(`${this.path}/getOne`, checkAdminToken, this.getOne);
    this.router.post(
      `${this.path}/create`,
      [validationMiddleware(LiteralCreateDto), checkAdminToken],
      this.create
    );
    this.router.put(
      `${this.path}/update`,
      [validationMiddleware(LiteralUpdateDto), checkAdminToken],
      this.update
    );
    this.router.delete(`${this.path}/one/:id`, checkAdminToken, this.delete);
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: GetAllDto = request.body;
      const items = await this.literalService.getAll(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllForLanguage = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const language: any = request.params.language;
      const items = await this.literalService.getAllForLanguage(language);
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
      const item: LiteralI = await this.literalService.getOne(id);
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
      const body: any = request.body;
      const item = await this.literalService.create(body);
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
      const body: any = request.body;
      const item = await this.literalService.update(body);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private delete = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const id: string = request.params.id;
      const item = await this.literalService.deleteOne(id);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
