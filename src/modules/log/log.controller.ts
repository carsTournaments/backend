import { NextFunction, Request, Response, Router } from 'express';
import { ControllerI } from '@interfaces';
import { HttpException } from '@core/exceptions';
import { LogService, LogGetAllDto } from '@log';

export class LogController implements ControllerI {
  path = '/logs';
  router = Router();
  private logService = new LogService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/getAll/:type/?:order`, this.getAll);
    this.router.delete(`${this.path}/all`, this.deleteAll);
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: LogGetAllDto = {
        type: request.params.type,
        order: request.params.order,
      };
      const items = await this.logService.getAll(body);
      response.status(200).send(items);
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
      const items = await this.logService.deleteAll();
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
