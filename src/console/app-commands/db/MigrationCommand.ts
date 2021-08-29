import { injectable } from 'inversify';
import { ICommandConfig } from '../../interfaces/ICommandConfig';
import { BaseSequelizeCommand } from './BaseSequelizeCommand';

@injectable()
export class MigrationCommand extends BaseSequelizeCommand{

  getName(): string {
    return "db:migrate";
  }

  init(): ICommandConfig {
    return {
      description: "Run migration",
      usage: "",
      passOptionsAsObject: true,
      options:[
        {
          name: "direction",
          type: "string",
          description: "The direction of the migration (up/down)",
          alias: "d",
          defaultValue: "up",
        },
        {
          name: "file",
          type: "string",
          description: "a specific migration file to run",
          alias: "f",
        },
        {
          name: "confirm",
          type: "boolean",
          description: "confirm migration",
          alias: "c",
          defaultValue: false,
        }
      ],
      questions: [
        {
          type: "list",
          name: "confirm",
          message: "Are you sure you want to continue?",
          choices: [
            'Yes',
            'No'
          ],
          default: "No",
        }
      ],
    };
  }
  showPrompt(config: ICommandConfig, options:any|string[], called_command?: string): boolean {
    const confirm = this.confirmed(options);
    return !confirm;
  }

  /**
   * Checks whether the user confirmed the migration.
   *
   * @param options
   * @return boolean
   */
  confirmed(options: any): boolean{
    let confirm = true;
    if (options.confirm && typeof options.confirm === 'boolean') {
      confirm = options.confirm > 1 || options.confirm;
    }
    if( typeof options.confirm === "string") {
      confirm = parseInt(options.confirm) > 0 || options.confirm === "true";
    }
    else {
      confirm = options.confirm;
    }
    return confirm;
  }
  async run(args:any|string[], options:any|string[], called_command?:string): Promise<any> {
    if (options.direction !== 'up' && options.direction !== 'down') {
      throw Error('Direction is not valid, valid directions are: up, down');
    }
    let confirmed = false;
    if (options.answers && options.answers.confirm && options.answers.confirm === "No"){
      // check the passed options:
      confirmed = this.confirmed(options);
    }
    if(!confirmed) {
      return null;
    }
    if(!this.umzugService.umzug){
      this.umzugService.initUmzug();
    }
    if (options.file) {
      if (options.direction === 'up') {
        await this.umzugService.umzug.up(options.file);
      }
      else {
        await this.umzugService.umzug.down(options.file);
      }
    }
    else {
      //const order: "asc"|"desc" =  direction === "up"? "asc": "desc";
      if (options.direction === "up") {
        const pending = await this.umzugService.getPending();
        if (pending && pending.length) {
          await this.umzugService.umzug.execute({migrations:pending, method: options.direction});
        }
      }
      else if (options.direction === 'down') {
        await this.umzugService.umzug.down({to: 0});
      }
      else {
        this.logger.info('No pending migrations to run.');
      }
    }
  }
}