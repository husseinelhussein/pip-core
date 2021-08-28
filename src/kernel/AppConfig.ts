import { IAppConfig } from './interfaces/IAppConfig';
import { Kernel } from './kernel';
import { ISequelizeOptions } from './interfaces/ISequelizeOptions';

export class AppConfig implements IAppConfig{
  // App config:
  env = '';
  log_successful_requests = false;
  app_host = "";
  app_port = 0;

  // JWT
  app_key = "";
  app_key_issuer = "";
  app_key_audience = "";
  app_token_expires_in = "";

  db: ISequelizeOptions = {};
  // App directories paths:
  models_path: string[] = [];
  seeders_path = '';
  seeders_compiled_path = '';
  migrations_path = '';
  migrations_compiled_path = '';
  migrate_from_ts = false;
  routes_path =  '';
  controllers_path = '';
  repositories_path = '';
  factories_path = '';
  services_path = '';
  resources_path = '';
  commands_path = '';
  temp_path = "";
  importers_path = '';

  // Importer config:
  import_api = '';
  import_enabled = false;
  existing_data_strategy = "skip";
  api_username = "";
  api_password = "";
  importers_to_run: string[] = [];
  items_per_importer = 0;
  constructor(env?: string){
    this.load(env);
  }
  load(env?: string):IAppConfig{
    const env_dir = Kernel.getRoodDir() + "/env/";
    // Load the default environment variables:
    const defaultConf = require(env_dir + "default.config");
    // Load the environment from a file based on the key app_env from "default.config":
    const env_name = env? env: defaultConf.env;
    const overrides = require(env_dir + env_name + ".config");
    process.env.APP_ENV = env_name;
    return this.mergeConfig(defaultConf, overrides);
  }

  mergeConfig(first: IAppConfig, second:IAppConfig): IAppConfig {
    const conf:any = Object.assign(first,second);
    const properties = Object.keys(this);
    for(const key of Object.keys(conf)){
      if(properties.includes(key)){
        (this as any)[key] = conf[key];
      }
    }
    return conf;
  }
}