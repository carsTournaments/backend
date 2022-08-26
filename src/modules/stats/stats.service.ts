import moment from 'moment';
import * as Os from 'os';
import { User } from '@user';
import { Brand } from '@brand';
import { Car } from '@car';
import { UtilsService } from '@services';
import { Tournament } from '@tournament';
import { Vote } from '@vote';
import { StatsResumeI, StatsGetResumeDto } from '@stats';

export class StatsService {
  utilsService = new UtilsService();

  getResume = async (body: StatsGetResumeDto): Promise<any[]> => {
    let all = [];
    if (body.type === 'all') {
      all = await this.getAllItems();
    } else {
      all = (await this.getAllItems()).filter(
        (item) => item.type === body.type
      );
    }
    for (const category of all) {
      for (const item of category.items) {
        await this.getTotalForItem(item);
      }
    }

    all = await this.setServerItems(all);
    return all;
  };

  private async getAllItems() {
    let online: any = Os.uptime();
    const ip =
      Os.networkInterfaces().eth0 !== undefined
        ? Os.networkInterfaces().eth0[0].address
        : 'No disponible';
    const cpuUsage: number = await this.getCPUUsage(false);
    online = moment().unix() - online;
    online = moment.unix(online).locale('ES').fromNow();
    return [
      {
        name: 'Info',
        type: 'info',
        items: [
          {
            total: 0,
            name: 'Coches',
            link: '/cars',
            bg: 'bg-red-800',
            text: 'text-white',
            id: 'car',
            model: Car,
          },
          {
            total: 0,
            name: 'Torneos',
            id: 'tournament',
            link: '/tournaments',
            bg: 'bg-dark',
            text: 'text-white',
            model: Tournament,
          },
          {
            total: 0,
            name: 'Usuarios',
            id: 'user',
            link: '/users',
            bg: 'bg-red-800',
            text: 'text-white',
            model: User,
          },
        ],
      },
      {
        name: 'Torneos',
        type: 'site',
        items: [
          {
            total: 0,
            name: 'Torneos',
            id: 'tournament',
            model: Tournament,
          },
          {
            total: 0,
            name: 'Torneos hoy',
            id: 'today',
            model: Tournament,
          },
          {
            total: 0,
            name: 'Torneos ayer',
            id: 'yesterday',
            model: Tournament,
          },
          {
            total: 0,
            name: 'Torneos 30 ultimos dias',
            id: '30lastDays',
            model: Tournament,
          },
        ],
      },
      {
        name: 'Eventos',
        type: 'event',
        items: [
          {
            total: 0,
            name: 'Eventos',
            id: 'events',
            model: Event,
          },
          {
            total: 0,
            name: 'Eventos hoy',
            id: 'today',
            model: Event,
          },
          {
            total: 0,
            name: 'Eventos ayer',
            id: 'yesterday',
            model: Event,
          },
          {
            total: 0,
            name: 'Eventos 30 ultimos dias',
            id: '30lastDays',
            model: Event,
          },
        ],
      },
      {
        name: 'Servidor',
        type: 'server',
        items: [
          {
            total: Os.hostname(),
            name: 'Hostname',
          },
          {
            total: ip,
            name: 'Ip',
          },
          {
            total: online,
            name: 'Tiempo online',
          },
          {
            total: cpuUsage.toFixed(2),
            name: 'Uso CPU',
          },
          {
            total: `${this.utilsService.bytesToSize(
              Os.freemem(),
              2
            )}/${this.utilsService.bytesToSize(Os.totalmem(), 2)}`,
            name: 'Memoria Ram disponible',
          },
        ],
      },
    ];
  }

  private getTotalForItem(itemAll: any): Promise<StatsResumeI[]> {
    return new Promise(async (resolve, reject) => {
      try {
        let days;
        const now = moment();
        if (itemAll.id === 'today') {
          days = this.remDays(now, 0);
        } else if (itemAll.id === 'yesterday') {
          days = this.remDays(now, 1);
        } else if (itemAll.id === '30lastDays') {
          days = this.remDays(now, 30);
        }

        let query = {};
        if (days) {
          query = {
            created: {
              $lte: `${moment().format('YYYY-MM-DD')} 23:59:59`,
              $gte: `${days.format('YYYY-MM-DD')} 00:00:01`,
            },
          };
        }
        if (itemAll.model === Brand) {
          itemAll.total = (await Brand.find(query).exec()).length;
        } else if (itemAll.model === Car) {
          itemAll.total = (await Car.find(query).exec()).length;
        } else if (itemAll.model === Tournament) {
          itemAll.total = (await Tournament.find(query).exec()).length;
        } else if (itemAll.model === User) {
          itemAll.total = (await User.find(query).exec()).length;
        } else if (itemAll.model === Vote) {
          itemAll.total = (await Vote.find(query).exec()).length;
        }

        resolve(itemAll);
      } catch (error) {
        reject(error);
      }
    });
  }

  private remDays(date: moment.Moment, days: number): moment.Moment {
    return date.add(-days, 'days');
  }

  private async setServerItems(allItems: any[]) {
    return allItems;
  }

  getCPUUsage(free: boolean): Promise<number> {
    return new Promise((resolve) => {
      const stats1 = this.getCPUInfo();
      const startIdle = stats1.idle;
      const startTotal = stats1.total;

      setTimeout(() => {
        const stats2 = this.getCPUInfo();
        const endIdle = stats2.idle;
        const endTotal = stats2.total;

        const idle = endIdle - startIdle;
        const total = endTotal - startTotal;
        const perc = idle / total;

        if (free) {
          resolve(perc);
        } else {
          resolve(1 - perc);
        }
      }, 1000);
    });
  }

  private getCPUInfo() {
    const cpus = Os.cpus();

    let user = 0;
    let nice = 0;
    let sys = 0;
    let idle = 0;
    let irq = 0;
    let total = 0;

    // tslint:disable-next-line: forin
    for (const cpu in cpus) {
      user += cpus[cpu].times.user;
      nice += cpus[cpu].times.nice;
      sys += cpus[cpu].times.sys;
      irq += cpus[cpu].times.irq;
      idle += cpus[cpu].times.idle;
    }

    total = user + nice + sys + idle + irq;

    return {
      idle,
      total,
    };
  }
}
