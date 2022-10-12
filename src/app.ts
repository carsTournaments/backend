import express from 'express';
import { AppService } from './core/services/app.service';
import { Config } from './core/config/app.config';
import { Logger } from '@services';
import { initializeControllers } from './routes';
import { connectToDB } from './db';

let appService: AppService;
const app = express();
const env = Config.env;

const init = () => {
  appService = new AppService(app);
  connectToDB();
  appService.enablePromClient(app);
  appService.initStaticRoutes(app);
  appService.initMiddlewares();
  initializeControllers(app);
  appService.initializeErrorHandling();
  appService.initMonitor();
  if (env !== 'test') {
    appService.initCrontab();
    app.listen(Config.port, () => {
      Logger.info(`[Server] CarsTournaments ${Config.env}`);
      appService.createCache();
    });
  }
};

init();

export default app;
