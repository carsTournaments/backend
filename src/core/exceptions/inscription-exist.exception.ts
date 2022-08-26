import { HttpException } from './http.exception';

export class InscriptionExistsException extends HttpException {
  constructor() {
    super(400, `El coche no se puede eliminar, existen inscripciones`);
  }
}
