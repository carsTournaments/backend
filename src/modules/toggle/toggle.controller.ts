import { HttpException } from '@exceptions';
import { IdDto, SiteDto } from '@dtos';
import { ControllerI } from '@interfaces';
import {
  validationMiddleware,
  checkAdminToken,
  verifyCache,
} from '@middlewares';
import { NextFunction, Request, Response, Router } from 'express';
import {
  ToggleCreateDto,
  ToggleI,
  ToggleService,
  ToggleUpdateDto,
} from '@toggle';

export class ToggleController implements ControllerI {
  path = '/toggles';
  router = Router();
  private toggleService = new ToggleService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getAll`,
      [validationMiddleware(SiteDto), verifyCache('toggle.getAll')],
      this.getAll
    );
    this.router.post(
      `${this.path}/getOne`,
      [validationMiddleware(IdDto), checkAdminToken],
      this.getOne
    );
    this.router.post(
      `${this.path}/create`,
      [validationMiddleware(ToggleCreateDto), checkAdminToken],
      this.create
    );
    this.router.put(
      `${this.path}/update`,
      [validationMiddleware(ToggleUpdateDto), checkAdminToken],
      this.update
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
      const body: SiteDto = request.body;
      const items: ToggleI[] = await this.toggleService.getAll(body);
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
      const result: ToggleI = await this.toggleService.getOne(body.id);
      response.status(200).send(result);
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
      const body: ToggleCreateDto = request.body;
      const item: ToggleI = await this.toggleService.create(body);
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
      const body: ToggleUpdateDto = request.body;
      const item: ToggleI = await this.toggleService.update(body);
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
      const result = await this.toggleService.deleteOne(id);
      response.status(200).send(result);
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
      const result = await this.toggleService.deleteAll();
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
