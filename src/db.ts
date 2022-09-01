import { Config } from '@core/config';
import { Logger } from '@services';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;
mongoose.Promise = Promise;

export const getUri = async () => {
  mongoServer = await MongoMemoryServer.create();
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

export const closeDatabase = async () => {
  if (process.env.NODE_ENV === 'test') {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  }
};

export const clearDatabase = async () => {
  if (process.env.NODE_ENV === 'test') {
    for (const key in mongoose.connection.collections) {
      const collection = mongoose.connection.collections[key];
      await collection.deleteMany({});
    }
  }
};
