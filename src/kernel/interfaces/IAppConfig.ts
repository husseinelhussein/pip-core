import { ISequelizeOptions } from './ISequelizeOptions';
import {IStorageConfig} from "../../storage/interfaces/IStorageConfig";

export interface IAppConfig {
  // App config:
  env: string,
  log_successful_requests: boolean,

  app_host: string,
  app_port: number;

  db: ISequelizeOptions;

  // JWT
  app_key: string,
  app_key_issuer: string,
  app_key_audience: string,
  app_token_expires_in: string,

  // App directories paths:
  models_path: string[],
  seeders_path: string,
  seeders_compiled_path: string,
  migrations_path: string,
  migrations_compiled_path: string,
  migrate_from_ts: boolean,
  routes_path: string,
  controllers_path: string,
  repositories_path: string,
  services_path: string,
  resources_path: string,
  factories_path: string,
  commands_path: string,
  temp_path: string,
  storage?: IStorageConfig;
}