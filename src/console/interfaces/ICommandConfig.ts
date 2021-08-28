import { QuestionCollection } from 'inquirer';
export interface IArgConfig {
  name:string,
  description: string,
  required?: boolean,
  type: "boolean"|"string",
  alias:string,
  defaultValue?:any,
  asArg?: boolean
}
export interface IArg {
  config?: IArgConfig,
  value: any,
  command: string|null,
}

export interface ICommandConfig {
  description?:string,
  argsDescription?: {[argName: string]: string}
  usage:string
  options?: IArgConfig[],
  allowUnknownOptions?: boolean;
  passOptionsAsObject?: boolean;
  passArgsAsObject?: boolean;
  callParents?: boolean;
  questions?:QuestionCollection<any>
}
export interface UnknownCommand {
  name: string|null,
  [key: string]: any,
}