import { ICommandConfig } from './interfaces/ICommandConfig';

export abstract class BaseCommand {
  protected sub_commands: BaseCommand[];

  public abstract getName():string

  /**
   * Initializes the command.
   */
  public abstract init():ICommandConfig;

  public getCommands(): string[]{
    return [];
  }
  public set subCommands(subCommands: BaseCommand[]){
    this.sub_commands = subCommands;
  }
  public get subCommands(): BaseCommand[]{
    return this.sub_commands;
  }

  /**
   * When the command is interactive,
   * this tells the CommandManager whether to show prompt or not
   *
   * @param config: the command config.
   * @param options: the command options.
   * @param called_command: the called command.
   *
   * @return boolean: if true, it will show prompt
   */
  public showPrompt(config:ICommandConfig, options:any|string[], called_command?:string): boolean{
    return true;
  }

  /**
   * Runs the command.
   */
  public async abstract run(args:any|string[],options:any|string[], called_command?:string):Promise<any>

}
