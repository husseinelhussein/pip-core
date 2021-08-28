import { OptionValue } from '../console/utils/interfaces/OptionValue';
import * as commander from 'commander';
export type listener = (command:commander.Command, args:any[]|object, options:any[]|object, command_name?:string) => void;
export {}
declare module "commander" {

  interface CommandOptions {
    passArgsAsObject?: boolean;
    passOptionsAsObject?: boolean;
  }

  export interface Command extends NodeJS.EventEmitter{
    _em2_events: string[];
    isKnownArg(str: string,args: string[], commands?: commander.Command[]): boolean;
    patternMatch(search: string, searchIn: string): boolean;
    hasWildCard(str?:string):boolean;
    hasParent(): boolean;
    searchTree(str: string, listener?: any|null):Array<any>|false;
    searchForEvent(args: string[]):string|false;
    passArgsAsObject(pass?:boolean):commander.Command;
    passOptionsAsObject(pass?:boolean):commander.Command;
    callParents(call?: boolean): commander.Command;
    getCommandByName(name:string, commands?: commander.Command[]): commander.Command;
    getExpectedArgs(command_name: string): string[]|null;
    parseCommandArgs(command:string, args: any[]): any[];
    getRawArgs(): string[];
    getRootCommand(): commander.Command;
    buildOptionsValues(args:string[]): OptionValue[];
    isOptionAfterName(option_name: string): boolean;
    isCommandCalled(): boolean;
    getCalledName(command_name: string): string;
    optionFor(arg: string): commander.Command|undefined;
    baseAction(fn: (...args: any[]) => void):commander.Command;
    actionListener(fn: (...args: any[]) => void,args:any,unknown:any): void;
    version(str: string, flags?: string, description?: string): commander.Command;
    option(flags: string, description?: string, fn?: ((arg1: any, arg2: any) => void) | RegExp, defaultValue?: any): commander.Command;
    option(flags: string, description?: string, defaultValue?: any): commander.Command;
    requiredOption(flags: string, description?: string, fn?: ((arg1: any, arg2: any) => void) | RegExp, defaultValue?: any): commander.Command;
    requiredOption(flags: string, description?: string, defaultValue?: any): commander.Command;

    /**
     * Define a command, implemented using an action handler.
     *
     * @remarks
     * The command description is supplied using `.description`, not as a parameter to `.command`.
     *
     * @example
     *  program
     *    .command('clone <source> [destination]')
     *    .description('clone a repository into a newly created directory')
     *    .action((command:commander.Command, args:any[]|object, options:any[]|object) => {
     *      console.log('clone command called');
     *    });
     *
     * @example
     *  // command with wildcard:
     *  program
     *    .command('clone:* <source> [destination]')
     *    .description('clone a repository into a newly created directory')
     *    .action((command:commander.Command, args:any[]|object, options:any[]|object, command_name?:string) => {
     *      console.log('clone command called');
     *    });
     *
     *
     * @param nameAndArgs - command name and arguments, args are  `<required>` or `[optional]` and last may also be `variadic...`
     * @param description - description of executable command
     * @param opts - configuration options
     * @returns top level command for chaining more command definitions
     */
    command(nameAndArgs: string, description: string, opts?: commander.CommandOptions): commander.Command;

    /**
     * Define a command, implemented using an action handler.
     *
     * @remarks
     * The command description is supplied using `.description`, not as a parameter to `.command`.
     *
     * @example
     *  program
     *    .command('clone <source> [destination]')
     *    .description('clone a repository into a newly created directory')
     *    .action((command:commander.Command, args:any[]|object, options:any[]|object) => {
     *      console.log('clone command called');
     *    });
     *
     * @example
     *  // command with wildcard:
     *  program
     *    .command('clone:* <source> [destination]')
     *    .description('clone a repository into a newly created directory')
     *    .action((command:commander.Command, args:any[]|object, options:any[]|object, command_name?:string) => {
     *      console.log('clone command called');
     *    });
     *
     *
     * @param nameAndArgs - command name and arguments, args are  `<required>` or `[optional]` and last may also be `variadic...`
     * @param opts - configuration options
     * @returns new command
     */
    command(nameAndArgs: string, opts?: commander.CommandOptions):  commander.Command;

    /**
     * Register callback `fn` for the command.
     *
     * @example
     *      program
     *        .command('help')
     *        .description('display verbose help')
     *        .action((command:commander.Command, args:any[]|object, options:any[]|object, command_name?:string) => {
     *           console.log('help called');
     *        });
     *
     * @returns Command for chaining
     */
    action(fn:listener): commander.Command;

  }
  type CommandConstructorT = { new (name?: string): commander.Command };
  interface CommanderStatic extends commander.Command {
    Command: CommandConstructorT;
  }
}