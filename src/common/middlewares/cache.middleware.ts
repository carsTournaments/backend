import { CacheDataI, CacheI, RequestExtendedI } from '@interfaces';
import * as express from 'express';
import { Logger } from '@services';
import { NextFunction, Response } from 'express';
import { CacheService } from '@cache';

const cacheService = new CacheService();

export const verifyCache = (name: string): express.RequestHandler => {
  return async (req: RequestExtendedI, res: Response, next: NextFunction) => {
    try {
      const item: CacheI = cacheService.findByName(name);
      if (item) {
        let cacheName = item.value;
        if (item.data) {
          cacheName = setCacheIdValid(item, req);
        }
        const cached = await cacheService.get(cacheName);
        if (cached) {
          return res.status(200).json(cached);
        } else {
          next();
        }
      } else {
        next();
      }
    } catch (error) {
      Logger.error(error);
      return res.status(400).json({ message: 'Error al leer la cache' });
    }
  };
};

const setCacheIdValid = (item: CacheI, req: RequestExtendedI) => {
  let cacheName = item.value;
  item.data.forEach((data: CacheDataI) => {
    if (data.type === 'body') {
      cacheName += `_${req.body[data.key]}`;
    } else if (data.type === 'params') {
      cacheName += `_${req.params[data.key]}`;
    } else if (data.type === 'token') {
      cacheName += `_${req.user[data.key]}`;
    }
  });
  return cacheName;
};
