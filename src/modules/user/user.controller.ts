import { NextFunction, Request, Response, Router } from 'express';
import {
  UserCreateDto,
  UserCreateFakeDto,
  UserGetAllDto,
  UserI,
  UserService,
  UserUpdateDto,
} from '@user';
import { ControllerI, RequestExtendedI } from '@interfaces';
import { UserTokenI } from '@auth';
import { HttpException } from '@exceptions';
import { IdDto, SearchDto } from '@dtos';
import {
  validationMiddleware,
  checkAdminToken,
  checkUserToken,
  verifyCache,
} from '@middlewares';

export class UserController implements ControllerI {
  path = '/users';
  router = Router();
  private userService = new UserService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getAll`,
      validationMiddleware(UserGetAllDto),
      checkAdminToken,
      this.getAll
    );

    this.router.post(
      `${this.path}/getResume`,
      [checkUserToken, verifyCache('user.getResume')],
      this.getResume
    );
    this.router.post(
      `${this.path}/search`,
      [validationMiddleware(SearchDto)],
      this.search
    );

    this.router.post(
      `${this.path}/one`,
      [
        verifyCache('user.getOne'),
        validationMiddleware(IdDto),
        checkAdminToken,
      ],
      this.getOne
    );
    this.router.post(
      `${this.path}/create`,
      [validationMiddleware(UserCreateDto), checkAdminToken],
      this.create
    );
    this.router.post(
      `${this.path}/createFake`,
      validationMiddleware(UserCreateFakeDto),
      checkAdminToken,
      this.createFake
    );
    this.router.put(
      `${this.path}/update`,
      validationMiddleware(UserUpdateDto),
      checkUserToken,
      this.update
    );
    this.router.delete(`${this.path}/one/:id`, checkAdminToken, this.deleteOne);
    this.router.delete(
      `${this.path}/allFake`,
      checkAdminToken,
      this.deleteAllFake
    );
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: UserGetAllDto = request.body;
      const items = await this.userService.getAll(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getResume = async (
    request: RequestExtendedI,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const user: UserTokenI = request.user;
      const item = await this.userService.getResume(user);
      response.status(200).send(item);
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
      const items = await this.userService.search(body);
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
      const item: UserI = await this.userService.getOne(id);
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
      const body: UserCreateDto = request.body;
      const user = await this.userService.create(body);
      response.status(200).send(user);
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
      const body: UserCreateFakeDto = request.body;
      const message = await this.userService.createFakeUsers(body.total);
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
      const body: UserUpdateDto = request.body;
      const item = await this.userService.update(body);
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
      const item = await this.userService.deleteOne(id);
      const message = item
        ? `Usuario ${id} eliminado`
        : `Usuario ${id} no existe`;
      response.status(200).send({ message });
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
      const result = await this.userService.deleteAllFake();
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
