import { PythonService } from '@services';
import { LogI } from './log.interface';

export class LogService {
  private pythonService = new PythonService();

  async getAll(body: { type: string; order: string }): Promise<LogI[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const filePath = 'logs-to-json.py';
        const args = [body.type];
        if (body.order) {
          args.push(body.order);
        }
        const response = await this.pythonService.executeFile<LogI[]>(
          filePath,
          [body.type]
        );
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  }
}
