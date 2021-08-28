import { BaseCommand } from '../../../src/console/BaseCommand';
import { ICommandConfig } from '../../../src/console/interfaces/ICommandConfig';
import { injectable } from 'inversify';

@injectable()
export class TestCommand extends BaseCommand{
  getName(): string {
    return 'my_command';
  }

  init(): ICommandConfig {
    return {
      description: "A command for testing",
      usage: "For testing",
      passArgsAsObject: true,
      options: [
        {
          name: "option-a",
          type: "string",
          description: "Option A description",
          alias: "a",
          required: true,

        }
      ]
    }
  }

  async run(args:any|string[],options:any|string[], called_command?:string): Promise<any> {
    console.log('this is a test command');
  }

}