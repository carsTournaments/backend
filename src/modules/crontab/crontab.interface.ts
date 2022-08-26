import * as schedule from 'node-schedule';

export interface CrontabI {
  type: string;
  cron: schedule.Job;
  id: string;
  date: string;
  start: boolean;
}

export interface StartCronDto {
  type: string;
  id: string;
  cronExpression: Date;
  action: any;
  date: string;
}
