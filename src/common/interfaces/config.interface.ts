export interface ConfigI {
  env: string;
  title: string;
  port: number;
  mongo: {
    uri: string;
    options: any;
  };
  seed: string;
  fcm: {
    server_key: string;
  };
  paths: {
    project: string;
    uploads: string;
  };
  logs: {
    http: string;
    error: string;
  };
}
