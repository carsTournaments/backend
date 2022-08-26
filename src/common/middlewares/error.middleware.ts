import { HttpException } from '@exceptions';
import { Request, Response } from 'express';

export const errorMiddleware = (
  error: HttpException,
  _request: Request,
  response: Response
) => {
  const status = error.status || 500;
  const message =
    error.message && error.message.length > 0
      ? error.message
      : 'Algo no ha ido bien...';
  response.status(status).send({
    status,
    message,
  });
};
