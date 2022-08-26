import { Router, NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions';
import { ControllerI } from '@interfaces';
import { validationMiddleware, checkAdminToken } from '@middlewares';
import { StatsService, StatsGetResumeDto } from '@stats';

export class StatsController implements ControllerI {
  path = '/stats';
  router = Router();
  private statsService = new StatsService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getResume`,
      [validationMiddleware(StatsGetResumeDto), checkAdminToken],
      this.getResume
    );
  }

  private getResume = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: StatsGetResumeDto = request.body;
      const result = await this.statsService.getResume(body);
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
