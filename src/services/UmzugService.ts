import { inject, injectable } from 'inversify';
import * as Umzug from "umzug";
import { Kernel } from '../kernel/kernel';
import { DatabaseService } from './DatabaseService';
import { Logger } from 'winston';
import * as _ from 'lodash';
import { Migration } from 'umzug';

declare let kernel: Kernel;
const baseExecuted = Umzug.prototype.executed;

// override the executed function so we can also migrate from typescript files:
Umzug.prototype.executed = function () {
  const mft = kernel.getConfig().migrate_from_ts;
  return baseExecuted.apply(this, [])
      .then((res: any) => {
        if(!mft){
          return res;
        }
        if(res && res.length) {
          res = res.map((item: Migration) => {
            return {
              path: (item as any).path.replace(/\.js$/ ,'.ts'),
              file: item.file.replace(/\.js$/ ,'.ts'),
            };
          });
        }
        return res;
      })
}

@injectable()
export class UmzugService {
  protected databaseService:DatabaseService;
  umzug: Umzug.Umzug;
  protected logger: Logger;
  constructor(@inject(DatabaseService) databaseService: DatabaseService, @inject("LoggerService") loggerService: Logger){
    this.databaseService = databaseService;
    this.logger = loggerService;
  }

  public initUmzug(){
    const config = kernel.getConfig();
    const db = this.databaseService.getDatabase();
    const umzug = new Umzug({
      storage: 'sequelize',
      storageOptions: {
        sequelize: db,
      },
      logging: (message:string) => this.log(message),
      // see: https://github.com/sequelize/umzug/issues/17
      migrations: {
        params: [
          db.getQueryInterface(), // queryInterface
          db.constructor, // DataTypes
          function() {
            throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.');
          }
        ],
        path: config.migrations_path,
        pattern: /\.js$|\.ts$/,
      },
    });
    this.umzug = umzug;
  }

  log(message: string, level = "info"){
    this.logger.log(level,message);
  }


  /**
   * Gets a list of pending migration files names.
   *
   * @param order: the order of the migrations.
   *
   * @return Promise: migrations names array
   */
  async getPending(order: "asc"|"desc" = "asc"):Promise<string[]>{
    if(!this.umzug){
      this.initUmzug();
    }
    const migrations:string[] = [];
    const pending = await this.umzug.pending();
    // resolve migration orders:
    for(const migration of pending){
      const file = await import((migration as any).path);
      if(file.hasOwnProperty('order')){
        (migration as any).order = file.order;
      }
    }
    // sort by order property:
    const sortedMigrations = _.orderBy(pending,['order'],[order]);

    // refine the migration name:
    for(const migration of sortedMigrations){
      const name = migration.file.replace(/\.js$|\.ts$/,'');
      migrations.push(name);
    }
    return migrations;
  }
}