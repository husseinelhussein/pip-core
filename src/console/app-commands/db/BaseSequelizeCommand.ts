import { BaseCommand } from '../../BaseCommand';
import { ICommandConfig } from '../../interfaces/ICommandConfig';
import { inject, injectable } from 'inversify';
import { MigrationCommand } from './MigrationCommand';
import { ModelCommand } from './ModelCommand';
import { UmzugService } from '../../../services/UmzugService';
import { Logger } from 'winston';

@injectable()
export class BaseSequelizeCommand extends BaseCommand{

  umzugService: UmzugService;
  logger: Logger;
  constructor(@inject(UmzugService) umzugService: UmzugService, @inject("LoggerService") loggerService: Logger){
    super();
    this.umzugService = umzugService;
    this.logger = loggerService;
  }

  getName(): string {
    return 'sequelize';
  }

  init(): ICommandConfig {
    return {
      description: "Database Commands",
      usage: "",
    }
  }
  getCommands(): string[] {
    return [
        "MigrationCommand",
        "OtherDbCommand",
        "SeedCommand"
    ];
  }

  async run(args:any|string[], options:any|string[], called_command?:string): Promise<any> {
    const stop = null;
    console.log('"sequelize" command ran');
  }
}