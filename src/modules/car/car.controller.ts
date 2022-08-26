import { NextFunction, Request, Response, Router } from 'express';
import {
  CarCreateDto,
  CarCreateFakeDto,
  CarGetAllDto,
  CarI,
  CarService,
  CarUpdateDto,
  CarGetGlobalRankingDto,
} from '@car';
import { HttpException, InscriptionExistsException } from '@exceptions';
import { IdDto, IdSiteDto, SearchDto } from '@dtos';
import { ControllerI, RequestExtendedI } from '@interfaces';
import {
  validationMiddleware,
  checkUserNotObligatory,
  checkUserToken,
  checkAdminToken,
} from '@middlewares';

export class CarController implements ControllerI {
  path = '/cars';
  router = Router();
  private carService = new CarService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getAll`,
      validationMiddleware(CarGetAllDto),
      this.getAll
    );
    this.router.post(
      `${this.path}/getAllDriverCars`,
      validationMiddleware(IdDto),
      this.getAllDriverCars
    );
    this.router.post(
      `${this.path}/getAllBrandCars`,
      validationMiddleware(IdDto),
      this.getAllBrandCars
    );
    this.router.post(
      `${this.path}/getGlobalRanking`,
      validationMiddleware(CarGetGlobalRankingDto),
      this.getGlobalRanking
    );
    this.router.post(`${this.path}/getCarStats`, this.getCarStats);
    this.router.post(
      `${this.path}/search`,
      [validationMiddleware(SearchDto)],
      this.search
    );
    this.router.post(
      `${this.path}/one`,
      [validationMiddleware(IdSiteDto), checkUserNotObligatory],
      this.getOne
    );
    this.router.post(
      `${this.path}/create`,
      [validationMiddleware(CarCreateDto), checkUserToken],
      this.create
    );
    this.router.post(
      `${this.path}/createFake`,
      [validationMiddleware(CarCreateFakeDto), checkAdminToken],
      this.createFake
    );
    this.router.put(
      `${this.path}/update`,
      [validationMiddleware(CarUpdateDto), checkUserToken],
      this.update
    );
    this.router.delete(`${this.path}/one/:id`, checkUserToken, this.deleteOne);
    this.router.delete(
      `${this.path}/allFake`,
      checkAdminToken,
      this.deleteAllFake
    );
    this.router.delete(
      `${this.path}/allFakeWithoutPhoto`,
      checkAdminToken,
      this.deleteAllFakeWithoutPhoto
    );
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: CarGetAllDto = request.body;
      const result = await this.carService.getAll(body);
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllDriverCars = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const items: CarI[] = await this.carService.getAllDriverCars(body.id);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllBrandCars = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const items: CarI[] = await this.carService.getAllBrandCars(body.id);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getGlobalRanking = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: CarGetGlobalRankingDto = request.body;
      const items = await this.carService.getGlobalRanking(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getCarStats = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const items = await this.carService.getCarStats();
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private search = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: SearchDto = request.body;
      const items = await this.carService.search(body);
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
      const item: CarI = await this.carService.getOne(body, user);
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
      const body: CarCreateDto = request.body;
      const item = await this.carService.create(body);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private createFake = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: CarCreateFakeDto = request.body;
      const message = await this.carService.createFakeCars(body.total);
      response.status(200).send(message);
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
      const body: CarUpdateDto = request.body;
      const item = await this.carService.update(body);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteOne = async (
    request: RequestExtendedI,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const id = request.params.id;
      const force = request.params.force;
      const user = request.user;
      const item = await this.carService.deleteOne(id, force === 'true', user);
      if (item) {
        const message = item
          ? `Coche ${id} eliminado`
          : `Coche ${id} no existe`;
        response.status(200).send({ message });
      } else {
        throw new InscriptionExistsException();
      }
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteAllFake = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.carService.deleteAllFake();
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteAllFakeWithoutPhoto = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.carService.deleteAllFakeWithoutPhoto();
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
