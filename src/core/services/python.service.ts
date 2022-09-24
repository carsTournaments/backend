import { Config } from '@core/config';
import { PythonShell, Options } from 'python-shell';

export class PythonService {
  private path = `${Config.paths.project}/scripts/python/`;

  constructor() {
    PythonShell.defaultOptions = { scriptPath: this.path };
  }
  async executeFile<T>(
    file: string,
    args: string[] = [],
    format = 'JSON'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const options: Options = {
        args: args,
      };
      PythonShell.run(file, options, (err, results: any) => {
        if (err) {
          reject({ message: 'Error' });
        }
        if (results && results.length > 0) {
          if (format === 'JSON') {
            resolve(JSON.parse(results[0]));
          } else {
            resolve(results);
          }
        } else {
          reject({ message: 'Error' });
        }
      });
    });
  }
}
