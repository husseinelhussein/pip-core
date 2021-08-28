import { injectable } from 'inversify';
import { ICommandConfig } from '../../interfaces/ICommandConfig';
import { BaseSequelizeCommand } from './BaseSequelizeCommand';

@injectable()
export class SeedCommand extends BaseSequelizeCommand{

  getName(): string {
    return "db:seed";
  }

  init(): ICommandConfig {
    return {
      description: "Seed Database",
      usage: "",
      passOptionsAsObject: true,
      options:[
        {
          name: "direction",
          type: "string",
          description: "The direction of the seeding (up/down)",
          alias: "d",
          defaultValue: "up",
        },
        {
          name: "name",
          type: "string",
          description: "a specific seeder name to run",
          alias: "f",
        }
      ]
    };
  }

  async run(args:any|string[], options:any|string[], called_command?:string): Promise<any> {
    if (options.direction !== 'up' && options.direction !== 'down') {
      throw Error('Direction is not valid, valid directions are: up, down');
    }
    if (options.file) {
      //
    }
    else {
      //
    }
  }
}