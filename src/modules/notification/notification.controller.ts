import { HttpException } from '@exceptions';
import { GetAllDto } from '@dtos';
import { ControllerI } from '@interfaces';
import {
  validationMiddleware,
  checkAdminToken,
  checkUserToken,
} from '@middlewares';
import { UserI } from '@user';
import { NextFunction, Request, Response, Router } from 'express';
import {
  NotificationCreateDto,
  NotificationService,
  NotificationUpdateFCMForUserDto,
} from '@notification';

export class NotificationController implements ControllerI {
  path = '/notifications';
  router = Router();
  private notificationService = new NotificationService();
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
      `${this.path}/create`,
      [validationMiddleware(NotificationCreateDto), checkAdminToken],
      this.create
    );

    this.router.post(
      `${this.path}/updateFCMForUser`,
      [validationMiddleware(NotificationUpdateFCMForUserDto), checkUserToken],
      this.updateFCMForUser
    );
    this.router.delete(`${this.path}/all`, checkAdminToken, this.deleteAll);
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: GetAllDto = request.body;
      const items = await this.notificationService.getAll(body);
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
      const body: NotificationCreateDto = request.body;
      const item = await this.notificationService.create(body);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private updateFCMForUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: NotificationUpdateFCMForUserDto = request.body;
      const item: UserI = await this.notificationService.updateFCMForUser(body);
      response.status(200).send(item);
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
      const result = await this.notificationService.deleteAll();
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
