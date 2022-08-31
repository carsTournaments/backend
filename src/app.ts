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
  appService.initializeMiddlewares();
  initializeControllers(app);
  appService.initializeErrorHandling();
  if (env !== 'test') {
    appService.createCache();
    appService.initializeCrontab();
    app.listen(Config.port, () => {
      Logger.warn(`CarsTournaments - ${Config.env}`);
      Logger.warn(
        Config.env === 'development'
          ? `${'http://localhost:' + Config.port}`
          : 'https://api.carstournaments.com'
      );
    });
  }
};

init();

export default app;
