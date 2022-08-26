import { Request, Response, Router } from 'express';
import { ControllerI } from '@interfaces';

export class DefaultController implements ControllerI {
  path = '/';
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.default);
  }

  private default = async (_request: Request, response: Response) => {
    response.status(200).send({
      message: 'Api de CarTournaments!',
    });
  };
}
