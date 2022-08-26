import express from 'express';
import http from 'http';
import { AppService } from './core/services/app.service';
import { Config } from './core/config/app.config';
import { Logger } from '@services';

class App {
  app: express.Application;
  server: http.Server;
  env: string;
  private appService: AppService;

  constructor(controllers: any) {
    this.app = express();
    this.env = Config.env;
    this.init(controllers);
  }

  async init(controllers: any) {
    this.appService = new AppService(this.app);
    this.appService.createCache();
    this.appService.connectToDB();
    this.appService.enablePromClient(this.app);
    this.appService.initStaticRoutes(this.app);
    this.appService.initializeMiddlewares();
    this.appService.initializeControllers(controllers);
    this.appService.initializeErrorHandling();
    if (this.env !== 'test') {
      this.appService.initializeCrontab();
    }
  }

  listen() {
    this.server = http.createServer(this.app);
    this.server.listen(Config.port, () => {
      Logger.warn(`CarsTournaments - ${Config.env}`);
      Logger.warn(
        Config.env === 'development'
          ? `${'http://localhost:' + Config.port}`
          : 'https://api.carstournaments.com'
      );
    });
  }

  getServer(): http.Server {
    return this.server;
  }
}

export default App;
