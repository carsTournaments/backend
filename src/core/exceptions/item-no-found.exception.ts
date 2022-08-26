import { Request } from 'express';
import { HttpException } from './http.exception';

export class ItemNotFoundException extends HttpException {
  constructor(request: Request, id: string) {
    super(404, `El item ${id} no existe`, request);
  }
}
