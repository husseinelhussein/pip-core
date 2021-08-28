import { Sequelize } from 'sequelize-typescript';
import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { Kernel } from '../kernel/kernel';
import { BaseService } from './BaseService';

declare let kernel: Kernel;

@injectable()
export class DatabaseService extends BaseService{
  protected loggerSer: Logger;
  private database: Sequelize;
  constructor(@inject("LoggerService") loggerService: Logger){
    super();
    this.loggerSer = loggerService;
  }

  public static isSingleton(){
    return true;
  }

  public init(){
    const config = kernel.getConfig();
    const options = config.db;
    options.models = config.models_path;
    const params:any = [options];
    if (options.url) {
      params.unshift(options.url);
    }
    this.database = new Sequelize(...params);
  }

  public async connect():Promise<Sequelize>{
    let connected = true;
    await this.database.authenticate().catch((err) => {
      connected = false;
      this.loggerSer.error('Failed to connect to database, ', err);
      this.loggerSer.info('env:', process.env);
    });

    if(connected){
      this.loggerSer.info("Successfully connected to database");
      return this.database;
    }
    throw new Error("Failed to connect to database");
  }

  public getDatabase():Sequelize{
    return this.database;
  }
}