import { NextFunction, Request, Response, Router } from 'express';
import {
  BrandI,
  BrandService,
  BrandCreateDto,
  BrandGetAllBrandsAndCarsDto,
  BrandGetAllDto,
  BrandUpdateDto,
} from '@brand';
import { ControllerI } from '@interfaces';
import { HttpException } from '@exceptions';
import { IdDto } from '@dtos';
import { validationMiddleware, checkAdminToken } from '@middlewares';

export class BrandController implements ControllerI {
  path = '/brands';
  router = Router();
  private brandService = new BrandService();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getAll`,
      validationMiddleware(BrandGetAllDto),
      this.getAll
    );
    this.router.post(
      `${this.path}/allOfAllBrandsAndCarsBrand`,
      validationMiddleware(BrandGetAllBrandsAndCarsDto),
      this.getAllBrandsAndCars
    );
    this.router.post(
      `${this.path}/one`,
      validationMiddleware(IdDto),
      this.getOne
    );
    this.router.post(
      `${this.path}/create`,
      validationMiddleware(BrandCreateDto),
      checkAdminToken,
      this.create
    );
    this.router.put(
      `${this.path}/update`,
      validationMiddleware(BrandUpdateDto),
      checkAdminToken,
      this.update
    );
    this.router.delete(`${this.path}/one/:id`, checkAdminToken, this.deleteOne);
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: BrandGetAllDto = request.body;
      const items = await this.brandService.getAll(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllBrandsAndCars = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: BrandGetAllBrandsAndCarsDto = request.body;
      const items = await this.brandService.getAllBrandsAndCars(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getOne = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const id = request.body.id;
      const item: BrandI = await this.brandService.getOne(id);
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
      const body: BrandCreateDto = request.body;
      const item = await this.brandService.create(body);
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
      const body: BrandUpdateDto = request.body;
      const item = await this.brandService.update(body);
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
      const item = await this.brandService.deleteOne(id);
      const message = item ? `Brand ${id} eliminado` : `Brand ${id} no existe`;
      response.status(200).send({ message });
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
