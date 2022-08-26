import { HttpException } from './http.exception';

export class ItemAlreadyExistsException extends HttpException {
  constructor() {
    super(400, `El item ya existe`);
  }
}
