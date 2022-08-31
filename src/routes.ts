import { DefaultController } from './modules/default/default.controller';
import { AnalyticsController } from '@analytics';
import { AuthController } from '@auth';
import { BrandController } from '@brand';
import { CarController } from '@car';
import { ImageController } from '@image';
import { InscriptionController } from '@inscription';
import { LikeController } from '@like';
import { LiteralController } from '@literal';
import { MenuController } from '@menu';
import { NotificationController } from '@notification';
import { OtaController } from '@ota';
import { PairingController } from '@pairing';
import { ReportController } from '@report';
import { RoundController } from '@round';
import { SettingsController } from '@settings';
import { StatsController } from '@stats';
import { ToggleController } from '@toggle';
import { TournamentController } from '@tournament';
import { UserController } from '@user';
import { VoteController } from '@vote';
import { WinnerController } from '@winner';
import { CacheController } from '@cache';

const controllers = [
  new AnalyticsController(),
  new AuthController(),
  new BrandController(),
  new CarController(),
  new CacheController(),
  new DefaultController(),
  new ImageController(),
  new InscriptionController(),
  new LikeController(),
  new LiteralController(),
  new MenuController(),
  new NotificationController(),
  new OtaController(),
  new PairingController(),
  new ReportController(),
  new RoundController(),
  new SettingsController(),
  new StatsController(),
  new ToggleController(),
  new TournamentController(),
  new UserController(),
  new VoteController(),
  new WinnerController(),
];

export const initializeControllers = (app: any) => {
  controllers.forEach((controller) => {
    app.use('/', controller.router);
  });
};
