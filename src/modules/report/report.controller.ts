import { NextFunction, Request, Response, Router } from 'express';
import {
  ReportCreateDto,
  ReportGetAllForUserDto,
  ReportI,
  ReportService,
  ReportUpdateDto,
} from '@report';
import { ControllerI, RequestExtendedI } from '@interfaces';
import { HttpException } from '@exceptions';
import { GetAllDto, IdDto, IdSiteDto } from '@dtos';
import {
  validationMiddleware,
  checkAdminToken,
  checkUserToken,
} from '@middlewares';

export class ReportController implements ControllerI {
  path = '/reports';
  router = Router();
  private ReportService = new ReportService();
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
      `${this.path}/allForUser`,
      [validationMiddleware(ReportGetAllForUserDto), checkUserToken],
      this.getAllOfUser
    );
    this.router.post(
      `${this.path}/allForCar`,
      validationMiddleware(IdDto),
      this.getAllOfCar
    );
    this.router.post(
      `${this.path}/one`,
      [validationMiddleware(IdSiteDto), checkUserToken],
      this.getOne
    );
    this.router.post(
      `${this.path}/create`,
      [validationMiddleware(ReportCreateDto), checkUserToken],
      this.create
    );
    this.router.put(
      `${this.path}/update`,
      [validationMiddleware(ReportUpdateDto), checkAdminToken],
      this.update
    );
    this.router.delete(`${this.path}/one/:id`, checkAdminToken, this.deleteOne);
    this.router.delete(
      `${this.path}/allForUser/:type/:userId`,
      checkAdminToken,
      this.deleteAllOfUser
    );
    this.router.delete(
      `${this.path}/allOfCar/:id`,
      checkAdminToken,
      this.deleteAllOfCar
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
      const items = await this.ReportService.getAll(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllOfUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: ReportGetAllForUserDto = request.body;
      const items: ReportI[] = await this.ReportService.getAllForUser(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllOfCar = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const items: ReportI[] = await this.ReportService.getAllOfCar(body.id);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getOne = async (
    request: RequestExtendedI,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdSiteDto = request.body;
      const user = request.user;
      const item: ReportI = await this.ReportService.getOne(body, user);
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
      const body: ReportCreateDto = request.body;
      const item = await this.ReportService.create(body);
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
      const body: ReportUpdateDto = request.body;
      const item = await this.ReportService.update(body);
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
      const item = await this.ReportService.deleteOne(id);
      const message = item
        ? `Emparejamiento ${id} eliminado`
        : `Emparejamiento ${id} no existe`;
      response.status(200).send({ message });
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteAllOfUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const params = request.params;
      const result = await this.ReportService.deleteAllOfUser(
        params.type,
        params.userId
      );
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteAllOfCar = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const id = request.params.id;
      const result = await this.ReportService.deleteAllOfCar(id);
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
      const result = await this.ReportService.deleteAll();
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
