import { NextFunction, Request, Response, Router } from 'express';
import { HttpException } from '@exceptions';
import { ControllerI } from '@interfaces';
import { checkAdminToken, validationMiddleware } from '@middlewares';
import { OtaCreateDto, OtaI, OtaService } from '@ota';

export class OtaController implements ControllerI {
  path = '/ota';
  router = Router();
  private otaService = new OtaService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/getAll`, checkAdminToken, this.getAll);
    this.router.get(`${this.path}/getOtaAvailable`, this.getOtaAvailable);
    this.router.post(
      `${this.path}/create`,
      [validationMiddleware(OtaCreateDto), checkAdminToken],
      this.create
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
      const items: OtaI[] = await this.otaService.getAll();
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getOtaAvailable = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const headers: any = request.header;
      const items = await this.otaService.getOtaAvailable(headers);
      response.status(200).send(items);
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
      const body: OtaCreateDto = request.body;
      const item: OtaI = await this.otaService.create(body);
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
      const result = await this.otaService.deleteOne(id);
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
      const result = await this.otaService.deleteAll();
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
