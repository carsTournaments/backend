import { NextFunction, Request, Response, Router } from 'express';
import {
  LikeCreateDto,
  LikeCreateFakeDto,
  LikeGetAllOfCarDto,
  LikeI,
  LikeService,
} from '@like';
import { ControllerI, MessageI, RequestExtendedI } from '@interfaces';
import { HttpException } from '@exceptions';
import { GetAllDto, IdDto, SearchDto } from '@dtos';
import {
  validationMiddleware,
  checkAdminToken,
  checkUserToken,
} from '@middlewares';

export class LikeController implements ControllerI {
  path = '/likes';
  router = Router();
  private likeService = new LikeService();
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
      `${this.path}/getAllCarLikes`,
      validationMiddleware(LikeGetAllOfCarDto),
      this.getAllCarLikes
    );
    this.router.post(
      `${this.path}/getAllReceivedForCar`,
      validationMiddleware(IdDto),
      this.getAllReceivedForCar
    );
    this.router.post(
      `${this.path}/getAllReceivedForUser`,
      validationMiddleware(IdDto),
      this.getAllReceivedForUser
    );
    this.router.post(
      `${this.path}/getAllUserSubmittedLikes`,
      validationMiddleware(IdDto),
      this.getAllUserSubmittedLikes
    );
    this.router.post(
      `${this.path}/search`,
      [validationMiddleware(SearchDto)],
      this.search
    );
    this.router.post(
      `${this.path}/create`,
      validationMiddleware(LikeCreateDto),
      this.create
    );
    this.router.post(
      `${this.path}/createFake`,
      [validationMiddleware(LikeCreateFakeDto), checkAdminToken],
      this.createFake
    );
    this.router.post(
      `${this.path}/cleanLikes`,
      checkAdminToken,
      this.cleanLikes
    );
    this.router.delete(`${this.path}/one/:id`, checkAdminToken, this.deleteOne);
    this.router.delete(
      `${this.path}/byCarId/:id`,
      checkUserToken,
      this.deleteByCarId
    );
    this.router.delete(
      `${this.path}/all`,
      checkAdminToken,
      this.deleteAllLikes
    );
  }

  private getAll = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: GetAllDto = request.body;
      const items = await this.likeService.getAll(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllCarLikes = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: LikeGetAllOfCarDto = request.body;
      const items: LikeI[] = await this.likeService.getAllCarLikes(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllReceivedForCar = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const items: LikeI[] = await this.likeService.getAllReceivedForCar(
        body.id
      );
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllReceivedForUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const items: LikeI[] = await this.likeService.getAllReceivedForUser(
        body.id
      );
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private getAllUserSubmittedLikes = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: IdDto = request.body;
      const items: LikeI[] = await this.likeService.getAllUserSubmittedLikes(
        body.id
      );
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
      const items = await this.likeService.search(body);
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private create = async (
    request: RequestExtendedI,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: LikeI = request.body;
      const item: LikeI = await this.likeService.create(body);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private createFake = async (
    request: RequestExtendedI,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const body: LikeCreateFakeDto = request.body;
      const item: MessageI = await this.likeService.createFake(body);
      response.status(200).send(item);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private cleanLikes = async (
    request: RequestExtendedI,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const item: MessageI = await this.likeService.cleanLikes();
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
      const item = await this.likeService.deleteOne(id);
      const message = item
        ? `Emparejamiento ${id} eliminado`
        : `Emparejamiento ${id} no existe`;
      response.status(200).send({ message });
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteByCarId = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const id = request.params.id;
      const result = await this.likeService.deleteByCarId(id);
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };

  private deleteAllLikes = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.likeService.deleteAll();
      response.status(200).send(result);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
