import * as mongoose from 'mongoose';

export interface NotificationI {
  _id?: string;
  users: string[];
  fcms: string[];
  title: string;
  message: string;
  link: string;
  opened?: number;
  key?: string;
  created?: string;
  updated?: string;
}

export interface NotificationMongoI extends mongoose.Document {
  users: string[];
  fcms: string[];
  title: string;
  message: string;
  link: string;
  opened?: number;
  created?: string;
  updated?: string;
}

export interface FCMBodyForNotificationI {
  to?: string;
  registration_ids?: string[];
  collapse_key: string;
  notification: {
    body: string;
    title: string;
  };
  data: {
    id: string;
    title: string;
    message: string;
    link: string;
    textButton: string;
  };
}

export interface FCMBodyForToI {
  userId: string;
  id: string;
}
