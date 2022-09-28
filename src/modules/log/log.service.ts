import { PythonService } from '@services';
import { LogI, LogGetAllDto } from '@log';
import fs from 'fs';
import { Logger } from '../../core/services/logger.service';
import { Config } from '@core/config';

export class LogService {
  private pythonService = new PythonService();

  async getAll(body: LogGetAllDto): Promise<LogI[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const filePath = 'logs-to-json.py';
        const args = body.order ? [body.type, body.order] : [body.type];
        const response = await this.pythonService.executeFile<LogI[]>(
          filePath,
          args
        );
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteAll() {
    try {
      const path = `${Config.paths.project}/logs/all.log`;
      fs.writeFileSync(path, '');
      Logger.warn('[Server] Logs eliminados');
      return { message: 'Logs eliminados' };
    } catch (err) {
      console.error(err);
    }
  }
}
