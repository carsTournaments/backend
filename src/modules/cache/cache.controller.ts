import { CacheService } from '@cache';
import { NextFunction, Request, Response, Router } from 'express';
import { HttpException } from '@exceptions';
import { ControllerI } from '@interfaces';
import { checkAdminToken } from '@middlewares';

export class CacheController implements ControllerI {
  path = '/cache';
  router = Router();

  private cacheService = new CacheService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/getAll`, checkAdminToken, this.getAll);
    this.router.delete(
      `${this.path}/one/:key`,
      checkAdminToken,
      this.deleteOne
    );
    this.router.delete(`${this.path}/all`, checkAdminToken, this.deleteAll);
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.cacheService.getAll();
      response.status(200).json(result);
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
      const key = request.params.key;
      const result = await this.cacheService.deleteOne(key);
      response.status(200).json(result);
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
      const result = await this.cacheService.deleteAll();
      response.status(200).json(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
