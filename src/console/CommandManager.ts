import { Container } from 'inversify';
import { Kernel } from '../kernel/kernel';
import { MigrationCommand } from './app-commands/db/MigrationCommand';
import { BaseCommand } from './BaseCommand';
import { Command } from 'commander';
import { ModelCommand } from './app-commands/db/ModelCommand';
import { IArgConfig, ICommandConfig } from './interfaces/ICommandConfig';
import { prompt } from "inquirer";
import { BaseSequelizeCommand } from './app-commands/db/BaseSequelizeCommand';
import { Manager } from '../container/Manager';
import {SeedCommand} from "./app-commands/db/SeedCommand";

declare let kernel: Kernel;
export class CommandManager extends Manager{
  protected static getPath():string{
    return kernel.getConfig().commands_path;
  }
  public static async register(container: Container):Promise<any>{
    let commands = await super.register(container, true);

    // Register app commands:
    const app_commands = [BaseSequelizeCommand, MigrationCommand, ModelCommand, SeedCommand];
    for(const app_command of app_commands){
      const command: any = app_command;
      container.bind(command).toSelf();
      container.bind(command.name).to(command);
    }
    commands = commands.concat(app_commands);
    // register all commands as array:
    const resolvedCommands = [];
    for(const command of commands){
      const res = container.get(command);
      resolvedCommands.push(res);
    }
    container.bind('AllCommands').toConstantValue(resolvedCommands);
  }

  public static getCommands():BaseCommand[]{
    const container: Container = kernel.getContainer();
    return container.get('AllCommands');
  }

  protected static hasParent(searchFor:BaseCommand, commands:BaseCommand[], container: Container): boolean{
    const name = searchFor.constructor.name;
    for(const com of commands){
      if(com.getCommands().includes(name)){
        const nameB = (com.constructor as any).__proto__.name;
        if(com.constructor.name === nameB){
          throw Error (`the command "${name}" declared itself as a sub-command`);
        }
        return true;
      }
    }
    return false;
  }

  public static async initCommands(program: Command, subCommands?: BaseCommand[], parent?: BaseCommand):Promise<any>{
    // 1. get commands classes
    let commands:BaseCommand[] = [];
    const subCommandsNames = [];
    if (subCommands) {
      commands = subCommands;
      for(const subCommand of subCommands){
        subCommandsNames.push(subCommand.constructor.name);
      }
    }
    else {
      commands = CommandManager.getCommands();
    }
    // 2. register all commands
    const container = kernel.getContainer();
    for(const command of commands){
      if (this.hasParent(command,commands,container)) {
        if (subCommands) {
          if(!subCommandsNames.includes(command.constructor.name)){
            continue;
          }
        }
        else{
          continue;
        }
      }
      const config = command.init();
      const command_name = command.getName();
      const pr = program.command(command_name);
      pr.name(command_name);
      pr.allowUnknownOption(true);
      pr.usage(config.usage);
      pr.passOptionsAsObject(config.passOptionsAsObject);
      pr.passArgsAsObject(config.passArgsAsObject);
      pr.allowUnknownOption(config.allowUnknownOptions);
      pr.callParents(config.callParents);
      if(config.description){
        pr.description(config.description, config.argsDescription);
      }
      let options:IArgConfig[] = [];
      if(config.options){
        options = config.options;
      }
      const globalOptions = this.getGlobalOptions();
      options = options.concat(globalOptions);
      config.options = options;
      for (const op of options) {
        let name = "-" + op.alias + ', ' + '--' + op.name;
        if (op.asArg) {
          name += ` [${op.name}]`
        }
        else {
          name += ` <${op.name}>`
        }
        if (op.required) {
          pr.requiredOption(name, op.description)
        }
        else {
          pr.option(name,op.description, op.defaultValue)
        }
      }
      pr.action(async (assoc_command, args, options, command_name) => this.runCommand(assoc_command, args, options, command_name, command, config));
      if(this.hasChildren(command)){
        const subCommands: BaseCommand[] = [];
        for(const comName of command.getCommands()){
          const subCommand:BaseCommand = container.get(comName);
          subCommands.push(subCommand);
        }
        command.subCommands = subCommands;
        await this.initCommands(pr, subCommands, command);
      }
    }
  }
  protected static hasChildren(command: BaseCommand):boolean{
    if(command.getCommands().length){
      const name = command.constructor.name;
      return !command.getCommands().includes(name);
    }
    return false;
  }
  public static getGlobalOptions():IArgConfig[]{
    return [
      {
        name: "interactive",
        alias: "i",
        description: "Interactive mode",
        defaultValue: true,
        type: "boolean"
      }
    ];
  }

  public static onUnknownCommand(program: Command, args: string[]):boolean{
    const stop = null;
    return false;
  }

  static async runCommand(associated_command: Command,
                          args: any,
                          options:any,
                          called_command:string|undefined,
                          command: BaseCommand,
                          config: ICommandConfig): Promise<any>{
    let interactiveEnabled = options.interactive;
    if (typeof options.interactive === 'string') {
      interactiveEnabled = options.interactive === "true" || options.interactive === "1";
    }
    // last arg is the interactive mode value:
    // if the command is interactive, show questions:
    if (config.questions) {
      let answers:any = this.getDefaultAnswer(config.questions);
      if (interactiveEnabled) {
        if (command.showPrompt(config, options, called_command)){
          answers = await prompt(config.questions);
        }
      }
      if(Array.isArray(options)){
        options.push(answers);
      }else{
        options['answers'] = answers;
      }
    }
    return command.run(args,options,called_command);
  }
  static getDefaultAnswer(questions: any, answers?: any):any{
    let _answers:any = {};
    if(answers){
      _answers = answers;
    }
    if(Array.isArray(questions)){
      for(const question of questions){
        this.getDefaultAnswer(question,_answers);
      }
    }else{
      if (questions.hasOwnProperty('default')) {
        if (questions.hasOwnProperty('name')) {
          _answers[questions.name] = questions.default;
        }
      }
      else if(questions.hasOwnProperty('name')){
        _answers[questions.name] = null;
      }
    }
    return _answers;
  }
}