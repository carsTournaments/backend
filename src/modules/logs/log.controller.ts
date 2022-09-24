import { NextFunction, Request, Response, Router } from 'express';
import { ControllerI } from '@interfaces';
import { HttpException } from '@core/exceptions';
import { LogService } from './log.service';
import { LogGetAllDto } from './log.dto';

export class LogController implements ControllerI {
  path = '/logs';
  router = Router();
  private logService = new LogService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/getAll/:type/?:order`, this.getAll);
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
}
