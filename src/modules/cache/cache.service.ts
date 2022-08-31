import Redis from 'ioredis';
import { CacheRoutes, CacheI, CacheGetAllI } from '@cache';
import { Logger } from '@services';
import moment from 'moment';

export class CacheService {
  private cache: Redis;

  create(): void {
    this.cache = new Redis();
  }

  async get(key: string): Promise<any> {
    if (!this.cache) {
      this.create();
    }
    const cache = await this.cache.get(key);

    if (cache) {
      return JSON.parse(cache);
    } else {
      return null;
    }
  }

  findByName(value: string): CacheI {
    const valueA = value.split('.');
    const category = valueA[0];
    const name = valueA[1];
    const item = CacheRoutes.find(
      (route: CacheI) => route.category === category && route.name === name
    );
    if (item) {
      return item;
    } else {
      return null;
    }
  }

  set(name: string, subname: string = null, value: string): void {
    if (!this.cache) {
      this.create();
    }
    const item = this.findByName(name);
    if (item) {
      const itemValue =
        subname !== null ? `${item.value}_${subname}` : item.value;
      const { expiration } = item;
      if (expiration) {
        this.cache.set(itemValue, value, 'EX', expiration);
      } else {
        this.cache.set(itemValue, value, 'EX', 15);
      }
    } else {
      return null;
    }
  }

  async getAll(): Promise<CacheGetAllI[]> {
    try {
      if (!this.cache) {
        this.create();
      }
      const items: CacheGetAllI[] = [];
      const keys = await this.cache.keys('*');
      for (const key of keys) {
        const expiration = await this.cache.ttl(key);
        const value = moment().add(expiration, 'seconds');
        const itemCache = await this.cache.get(key);
        const size: any = new TextEncoder().encode(itemCache).length;
        const item: CacheGetAllI = {
          name: key,
          size: this.bytesToSize(size),
          expiration: value.format('YYYY-MM-DD HH:mm:ss'),
        };

        items.push(item);
      }
      // order by name
      items.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      return items;
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  async deleteOne(key: string): Promise<any> {
    try {
      if (!this.cache) {
        this.create();
      }
      await this.cache.del(key);
      return { message: `La cache de ${key} ha sido eliminada` };
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  async deleteAll(): Promise<any> {
    try {
      if (!this.cache) {
        this.create();
      }
      await this.cache.flushdb();
      return { message: 'Toda la cache ha sido eliminada' };
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  async deleteByCategory(category: string) {
    try {
      if (!this.cache) {
        this.create();
      }
      const keys = await this.cache.keys(`${category}_*`);
      for (const key of keys) {
        await this.cache.del(key);
      }
      return { message: `Toda la cache de ${category} ha sido eliminada` };
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  private bytesToSize(bytes: number, ): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
