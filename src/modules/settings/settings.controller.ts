import { HttpException } from '@exceptions';
import { ControllerI } from '@interfaces';
import { checkAdminToken, validationMiddleware } from '@middlewares';
import { NextFunction, Request, Response, Router } from 'express';
import {
  SettingsI,
  SettingsCheckUpdateI,
  SettingsService,
  SettingsAppDto,
  SettingsCheckUpdateDto,
} from '@settings';

export class SettingsController implements ControllerI {
  path = '/settings';
  router = Router();
  private settingsService = new SettingsService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/getAll`, checkAdminToken, this.getAll);
    this.router.post(
      `${this.path}/getSettingsForApp`,
      [validationMiddleware(SettingsAppDto)],
      this.getSettingsApp
    );
    this.router.post(
      `${this.path}/checkUpdate`,
      validationMiddleware(SettingsCheckUpdateDto),
      this.checkUpdate
    );
    this.router.put(`${this.path}/update`, checkAdminToken, this.update);
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const items: SettingsI = await this.settingsService.getAll();
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getSettingsApp = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: SettingsAppDto = request.body;
      const items: SettingsI = await this.settingsService.getSettingsApp(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private checkUpdate = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: SettingsCheckUpdateDto = request.body;
      const items: SettingsCheckUpdateI =
        await this.settingsService.checkUpdate(body);
      response.status(200).send(items);
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
      const body: SettingsI = request.body;
      const items: SettingsI = await this.settingsService.update(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
