import { Config } from '@core/config';
import { Logger } from '@services';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

mongoose.Promise = Promise;

export const getUri = async () => {
  const mongoServer = await MongoMemoryServer.create();
  if (process.env.NODE_ENV === 'test') {
    return mongoServer.getUri();
  }

  return Config.mongo.uri;
};

export const connectToDB = async (): Promise<void> => {
  try {
    const uri = await getUri();
    mongoose.connect(uri, Config.mongo.options, () => {
      Logger.info('Conectado a MongoDB');
    });
  } catch (error) {
    Logger.error('No se pudo conectar a MongoDB, revisa .env');
  }
};
