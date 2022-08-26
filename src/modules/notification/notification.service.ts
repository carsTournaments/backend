import { GetAllDto } from '@dtos';
import { MessageI, PaginatorI } from '@interfaces';
import { UtilsService, Logger } from '@services';
import { User, UserI } from '@user';
import {
  NotificationI,
  Notification,
  NotificationCreateDto,
  notificationGetAllAggregate,
  NotificationUpdateFCMForUserDto,
} from '@notification';
import { Config } from '@core/config';

export class NotificationService {
  private FCM = require('fcm-node');
  private serverKey = Config.fcm.server_key;
  private fcm: any;
  private utilsService = new UtilsService();

  async getAll(
    body: GetAllDto
  ): Promise<{ items: NotificationI[]; paginator: PaginatorI }> {
    try {
      const { pageSize, currentPage, skip } =
        this.utilsService.getValuesForPaginator(body);
      const sort = this.utilsService.getOrderForGetAllAggregate(body);
      const aggregate = notificationGetAllAggregate(sort, skip, pageSize);
      const items = await Notification.aggregate(aggregate).exec();
      const total = await Notification.countDocuments({}).exec();
      const totalPages = Math.ceil(total / pageSize);
      const paginator: PaginatorI = {
        pageSize,
        currentPage,
        totalPages,
        total,
      };
      return { items, paginator };
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  create(notification: NotificationCreateDto) {
    return new Promise(async (resolve, reject) => {
      try {
        const notificationDB = await this.createNotification(notification);
        this.fcm = new this.FCM(this.serverKey);
        const message: any = this.setDataForFCM(notification, notificationDB);
        this.fcm.send(message, async (err: any) => {
          if (err) {
            await Notification.findByIdAndDelete(notificationDB._id).exec();
            reject({ message: 'No se ha podido enviar la notificacion' });
          } else {
            resolve({ message: 'Notificacion enviada' });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private setDataForFCM(
    notification: NotificationCreateDto,
    notificationDB: NotificationI
  ) {
    const message: any = {
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: notification.data,
    };
    message.data.id = notificationDB._id;
    message.data.message = notification.message;
    message.data.title = notification.title;
    if (!message.data.textButton) {
      message.data.textButton = 'OK';
    }

    if (notification.fcms.length === 1) {
      message['to'] = notification.fcms[0];
    } else if (notification.fcms.length > 1) {
      message['registration_ids'] = notification.fcms;
    }
    return message;
  }

  private createNotification(
    body: NotificationCreateDto
  ): Promise<NotificationI> {
    return new Promise(async (resolve, reject) => {
      try {
        const item = new Notification(body);
        const itemSaved = await item.save();
        resolve(itemSaved);
      } catch (error) {
        reject(error);
      }
    });
  }

  updateFCMForUser(data: NotificationUpdateFCMForUserDto): Promise<UserI> {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.findByIdAndUpdate(
          data.id,
          { fcm: data.token },
          {
            new: true,
          }
        ).exec();
        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteAll(): Promise<MessageI> {
    try {
      await Notification.deleteMany({}).exec();
      return { message: 'Todos las notificaciones han sido eliminadas' };
    } catch (error) {
      return error;
    }
  }
}
