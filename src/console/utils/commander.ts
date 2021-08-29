import * as commander from "commander";
import { Command, CommandOptions, Option } from 'commander';
import { ConstructorOptions, EventEmitter2 } from 'eventemitter2';
import { OptionValue } from './interfaces/OptionValue';
import { listener } from '../../@types/commander';
const baseCommand = commander.Command.prototype.command;
const baseParseArgs = commander.Command.prototype.parseArgs;
const baseParseOptions = commander.Command.prototype.parseOptions;
const outputHelpIfRequested = (cmd:any, options:any) =>{
  options = options || [];
  for (let i = 0; i < options.length; i++) {
    if (options[i] === cmd._helpLongFlag || options[i] === cmd._helpShortFlag) {
      cmd.outputHelp();
      // (Do not have all displayed text available so only passing placeholder.)
      cmd._exit(0, 'commander.helpDisplayed', '(outputHelp)');
    }
  }
};
const emitterOptions:ConstructorOptions = {wildcard: true, delimiter: "."};
const emitter = new EventEmitter2(emitterOptions);

commander.Command.prototype.isKnownArg = function(str: string, args: string[], commands: Command[] = this.commands):boolean {
  for(const command of commands){
    if(command._name === str || this.patternMatch(str,command._name)){
      return true;
    }
    if(command._args && command._args.length){
      let name = command._name;
      for(let i=0; i < args.length; i++){
        let commandIndex = args.indexOf(name);
        if(commandIndex < 0){
          if(this.patternMatch(args[i],name)){
            commandIndex = args.indexOf(args[i]);
            name = args[i]
          }
        }
        if(name === args[commandIndex]){
          // check if it comes after the command name:
          if((args.length -1) >= commandIndex && args[commandIndex +1] === str){
            return true;
          }
        }
      }
    }
    const is_arg = this.isKnownArg(str,args,command.commands);
    if(is_arg){
      return true;
    }
  }
  return false;
};
commander.Command.prototype.isOption = function(str: string):boolean{
  const args = this.getRootCommand()._args;
  for(let i=0;i<args.length; i++){
    const stop = null;
  }
  return false;
};
commander.Command.prototype.patternMatch = function(search: string, searchIn: string): boolean{
  if(this.hasWildCard(searchIn) && search){
    searchIn = searchIn.replace('*','');
    const unkName = search.substring(0,searchIn.length);
    if(searchIn === unkName){
      return true;
    }
  }
  return false;
};
commander.Command.prototype.hasWildCard = function (str:string = this._name): boolean{
  return str.search(/\*/) > -1;
};
commander.Command.prototype.hasParent = function (): boolean{
  const to_skip = ['index','console',''];
  if(this.parent && !to_skip.includes(this.parent._name)){
    return true;
  }
  return false;
};
commander.Command.prototype.searchTree = function (str: string, listener?: any|null, foundListeners:any = []): Array<any> {
  if(!listener){
    listener = (emitter as any).listenerTree;
  }
  for(const _listener of Object.keys(listener)){
    if(_listener === str){
      if (!foundListeners.includes(_listener)) {
        foundListeners.push(_listener);
      }

    }else if(this.patternMatch(str,_listener) && !foundListeners.includes(_listener)){
      foundListeners.push(_listener);
    }
    foundListeners = this.searchTree(str, listener[_listener], foundListeners);
  }
  // cleanup the tree:
  for(const lis of foundListeners) {
    if(lis === str) {
      foundListeners = foundListeners.filter((item: any) => {
        return !item.includes('*');
      });
      break;
    }
  }
  return foundListeners;
};
commander.Command.prototype.searchForEvent = function(args: string[]):string|false{
  let matchTree:string[] = [];
  const unmatch: string[] = [];
  for(const arg of args){
    if (arg.includes(' '))  {
      const subArgs = arg.split(' ');
      for(const subArg of subArgs) {
        const commands = this.searchTree(subArg);
        if(commands.length){
          matchTree = matchTree.concat(commands)
        }else{
          unmatch.push(arg);
        }
      }
    }
    else {
      const commands = this.searchTree(arg);
      if(commands.length){
        matchTree = matchTree.concat(commands);
      }else{
        unmatch.push(arg);
      }
    }
  }
  const unknown: string[] = [];
  for(const unk of unmatch){
    if(!this.isKnownArg(unk, args)){
      unknown.push(unk);
    }
  }
  if(unknown.length){
    console.log(`Unknown argument "${unknown[0]}"`);
    process.exit();
    //throw Error(`Unknown argument "${unknown[0]}"`);
  }
  let eventName = '';
  for(let i=0; i < matchTree.length; i++){
    if((i+1) < (matchTree.length)){
      eventName += matchTree[i] + ".";
    }
    else{
      eventName += matchTree[i];
    }
  }
  const listener = emitter.listeners(eventName);
  if(listener.length){
    return eventName;
  }
  return false;
};
commander.Command.prototype.passArgsAsObject = function (pass?:boolean):Command{
  this._passArgsAsObject = pass == true;
  return this;
};
commander.Command.prototype.passOptionsAsObject = function (pass?:boolean):Command{
  this._passOptionsAsObject = pass == true;
  return this;
};
commander.Command.prototype.callParents = function (call?:boolean):Command{
  this._callParents = call == true;
  return this;
};

commander.Command.prototype.getCommandByName = function (name:string, commands: Command[] = this.commands):Command|null {
  for(const command of commands){
    if(command._name === name){
      return command;
    }
    if(command.commands){
      const found = this.getCommandByName(name, command.commands);
      if(found){
        return found;
      }
    }
  }
  return null;
};
commander.Command.prototype.getExpectedArgs = function(command_name: string):string[]|null{
  const command = this.getCommandByName(command_name);
  if(command && command._args.length){
    return command._args;
  }
  return null;
};
commander.Command.prototype.parseCommandArgs = function (command:string, args: any[]):any[]{
  const hasArgs = this.getExpectedArgs(command);
  const expected:any[] = [];
  if(hasArgs){
    let command_index = null;
    // search for the command index in args:
    for(let i=0; i < args.length;i++){
      if(this.patternMatch(args[i],command) || args[i] === command){
        command_index = i;
        break;
      }
    }
    if(command_index !== null){
      // everything comes after the command index is an arg:
      for(let i=0; i < args.length;i++){
        if(i > command_index){
          expected.push(args[i]);
        }
      }
    }
  }
  return expected;
};
commander.Command.prototype.getRawArgs = function ():string[]{
  const command:Command = this.getRootCommand();
  return command.rawArgs;
};
commander.Command.prototype.getRootCommand = function ():Command{
  let rootCommand = this;
  while (rootCommand.parent) {
    rootCommand = rootCommand.parent;
  }
  return rootCommand;
};
commander.Command.prototype.buildOptionsValues = function(args:string[]):OptionValue[]{
  const options:OptionValue[] = [];
  for(let i=0; i < args.length;i++){
    let name;
    if(args[i].startsWith('--')){
      name = args[i];
    }
    else if(args[i].startsWith('-')){
      name = args[i];
    }

    if(name){
      const op = <OptionValue>{};
      op.name = name;
      if((i +1) <= args.length){
        op.value = args[i+1];
      }
      options.push(op);
    }
  }
  return options;
};
commander.Command.prototype.isOptionAfterName = function(option_name: string):boolean{
  // skip checking if this is the root command:
  const to_skip = ['console','index',''];
  if(to_skip.includes(this._name)){
    return true;
  }
  const rawArgs:string[] = this.getRawArgs();
  // get the command index in args:
  let com_index = null;
  for(let i=0;i<rawArgs.length;i++){
    // consider sub commands:
    if (rawArgs[i].includes(' ')) {
      const subRawArgs = rawArgs[i].split(' ');
      for(let y = 0; y < subRawArgs.length; y++ ) {
        if(subRawArgs[y] === this._name || this.patternMatch(subRawArgs[y], this._name)){
          com_index = i;
          break;
        }
      }
    }
    if (com_index) {
      break;
    }
    if(rawArgs[i] === this._name || this.patternMatch(rawArgs[i], this._name)){
      com_index = i;
      break;
    }
  }
  // get the option index in args:
  if(com_index !== null){
    let op_index = null;
    for(let i=0;i<rawArgs.length;i++){
      if(rawArgs[i].startsWith(option_name)){
        op_index = i;
      }
    }
    if(op_index !== null){
      return op_index > com_index;
    }
  }
  return false;
};
commander.Command.prototype.isCommandCalled = function(): boolean{
  const rawArgs:string[] = this.getRawArgs();
  // get the command index in args:
  let com_index = null;
  for(let i=0;i<rawArgs.length;i++){
    if(rawArgs[i] === this._name || this.patternMatch(rawArgs[i], this._name)){
      com_index = i;
    }
  }
  return com_index !== null;
};
commander.Command.prototype.getCalledName = function(command_name: string): string|null{
  const rawArgs:string[] = this.getRawArgs();
  for(let i=0;i<rawArgs.length;i++){
    if(rawArgs[i] === command_name || this.patternMatch(rawArgs[i], command_name)){
      return rawArgs[i];
    }
  }
  return null;
};
commander.Command.prototype.parseOptions = function(argv: any) {
  // the option should become after the current command name, otherwise skip parsing it:
  let unknown:any[] = [];
  const optionsValues = this.buildOptionsValues(argv);
  for(const opVal of optionsValues){
    const op = [opVal.name, opVal.value];
    const is_after = this.isOptionAfterName(opVal.name);
    if(!is_after){
      unknown = unknown.concat(op);
    }
  }
  if(unknown.length){
    return {args:[],unknown:unknown, found: false};
  }
  const options = baseParseOptions.apply(this, [argv]);
  const root_name = this.getRootCommand()._name;
  const to_skip = ['console','index',''];
  // if this is the root command just return the options:
  if (to_skip.includes(root_name) && to_skip.includes(this._name)) {
    return options;
  }
  if(options){
    // check if any of the unknown options are parsed:
    for(const arg of argv){
      if(options.unknown.includes(arg)){
        unknown.push(arg);
      }
    }
    options.found = unknown.length !== argv.length;
  }
  // search for the unknown options inside child commands:
  if (options && options.unknown.length && this.commands.length) {
    const optionsValues = this.buildOptionsValues(options.unknown);
    let unknown:any[] = [];
    for(const sub_command of this.commands){
      if(!this.isCommandCalled.apply(sub_command)){
        // we don't want to check sub command options if the command isn't called.
        continue;
      }
      for(const opVal of optionsValues){
        const op = [opVal.name, opVal.value];
        const sub_options = this.parseOptions.apply(sub_command,[op]);
        if(sub_options.found){
          options.found = true;
        }else{
          unknown = unknown.concat(op);
        }
      }
    }
    options.unknown = unknown;
  }
  return options;
};
commander.Command.prototype.parseArgs = function(args:string[], unknown:string[]){
  if(!args.length){
    return baseParseArgs.apply(this, [args,unknown]);
  }
  const name = this.searchForEvent(args);
  if(!name){
    return baseParseArgs.apply(this, [args, unknown]);
  }
  const commandHasOption = (name: string, option: string):boolean => {
    const command = this.getCommandByName(name);
    if(!command){
      return false;
    }
    const op = this.optionFor.apply(command,[option]);
    return op !== undefined;
  };
  const collectArgs = (command_name:string):Object|null => {
    const sub_command = this.getCommandByName(command_name);
    if(!sub_command){
      return null;
    }
    const called_name = this.getCalledName(command_name);
    const expected = this.parseCommandArgs(command_name, args);
    const options = this.buildOptionsValues(unknown);
    const command_options:any[] = [];
    for(const option of options){
      if(commandHasOption(command_name,option.name)){
        command_options.push(option.name,option.value);
      }
    }
    // add the command name to args:
    if(!expected.includes(called_name) && this.hasWildCard(command_name)){
      expected.push(called_name);
    }
    return {args: expected, options: command_options};
  };
  const commands_names = name.split(emitterOptions.delimiter);
  const las_command:Command|null = this.getCommandByName(commands_names[commands_names.length -1]);
  if(commands_names.length){
    for (let i=0; i < commands_names.length; i++) {
      // skip all parent commands and only call the target command:
      if(!las_command || !las_command._callParents){
        i = commands_names.length -1;
      }
      const command = this.getCommandByName(commands_names[i]);
      if(!command){
        continue;
      }
      const collected_args:any = collectArgs(commands_names[i]);
      if (i === 0 && !this.hasWildCard(commands_names[i])) {
        // call the first parent command:
        this.emit('command:' + commands_names[i], collected_args.args, collected_args.options);
      }
      else {
        // call sub_commands:
        const sub_name_ev = command._em2_events[command._em2_events.length -1];
        if(collected_args){
          emitter.emit(sub_name_ev, collected_args.args, collected_args.options);
        }
      }
    }
  }
  else {
    emitter.emit(name,name, args, unknown);
  }
  return this;
};
commander.Command.prototype.actionListener = function(fn: listener, args:any, unknown:any){
  // todo: fix mixing args and options with multiple nested commands
  const self = this;
  let called_name;
  if(self.hasWildCard() || self.hasParent()){
    called_name = args.pop();
  }
  // Parse any so-far unknown options
  args = args || [];
  unknown = unknown || [];

  const parsed = self.parseOptions(unknown);

  // Output help if necessary
  outputHelpIfRequested(self, parsed.unknown);
  self._checkForMissingMandatoryOptions();

  // If there are still any unknown options, then we simply
  // die, unless someone asked for help, in which case we give it
  // to them, and then we die.
  if (parsed.unknown.length > 0) {
    self.unknownOption(parsed.unknown[0]);
  }

  // Leftover arguments need to be pushed back. Fixes issue #56
  if (parsed.args.length) args = parsed.args.concat(args);

  self._args.forEach(function(arg:any, i:any) {
    if (arg.required && args[i] == null) {
      self.missingArgument(arg.name);
    } else if (arg.variadic) {
      if (i !== self._args.length - 1) {
        self.variadicArgNotLast(arg.name);
      }

      args[i] = args.splice(i);
    }
  });

  // The .action callback takes an extra parameter which is the command itself.
  const expectedArgsCount = self._args.length;
  let actionArgs = args.slice(0, expectedArgsCount);
  if(self._passArgsAsObject && actionArgs.length){
    const acArgs = actionArgs;
    actionArgs = [{}];
    for(const acArg of acArgs){
      for(const expArg of self._args){
        actionArgs[0][expArg.name] = acArg;
      }
    }
  }
  else if(actionArgs.length){
    const acArgs = actionArgs;
    actionArgs = [acArgs];
  }else{
    // default is empty
    actionArgs = [[]];
  }
  if (self._passCommandToAction) {
    actionArgs.unshift(self);
  } else {
    actionArgs.unshift(self.opts());
  }
  // convert options as object:
  if(self._passOptionsAsObject){
    const options_object = self.opts();
    actionArgs.push(options_object);
  }else{
    const opts = self.opts();
    const options = [];
    for(const key of Object.keys(opts)){
      if(opts[key] !== undefined){
        options.push(opts[key]);
      }
    }
    actionArgs.push(options);
  }
  // Add the extra arguments so available too.
  if (args.length > expectedArgsCount && !self._passOptionsAsObject) {
    actionArgs.push(args.slice(expectedArgsCount));
  }
  // if the command is wildcard, add the called command to args list:
  if(called_name){
    actionArgs.push(called_name);
  }
  // actionArgs order:
  // 1: the command object.
  // 2: the arguments if there is any.
  // 3: the options if there is any.
  // 4: the called command if it's wildcard command.
  const actionResult = fn.apply(self, actionArgs);
  // Remember result in case it is async. Assume parseAsync getting called on root.
  let rootCommand = self;
  while (rootCommand.parent) {
    rootCommand = rootCommand.parent;
  }
  rootCommand._actionResults.push(actionResult);
};
commander.Command.prototype.baseAction = function(fn:listener){
  const parent = this.parent || this;
  const name = parent === this ? '*' : this._name;
  parent.on('command:' + name, (args:any,unknown:any) => this.actionListener(fn,args,unknown));
  if (this._alias) parent.on('command:' + this._alias, (args:any,unknown:any) => this.actionListener(fn,args,unknown));
  return this;
};
commander.Command.prototype.command = function (nameAndArgs: string, description: string, opts?: CommandOptions):Command{
  const pr:Command = baseCommand.apply(this,[nameAndArgs,description,opts]);
  const getName = (command: Command): string => {
    let name = "";
    if(command.parent){
      name += getName(command.parent);
    }
    if(name.length){
      name += " ";
    }
    name += command._name;
    return name;
  };
  if(this.hasWildCard()){
    let name = getName(pr);
    name = name.replace(' ', '.');
    const stop = null;
  }
  return pr;
};
commander.Command.prototype.generateEventName = function():string{
  this._em2_events = [];
  const parent = this.parent || this;
  let name = null;
  if (parent === this || !parent._name.length) {
    name = this._name;
  }
  else{
    let parent_name = parent._name;
    if (parent._em2_events && parent._em2_events.length) {
      parent_name = parent._em2_events[parent._em2_events.length -1];
    }
    name = parent_name + emitterOptions.delimiter + this._name;
  }
  return name;
};
commander.Command.prototype.action = function (fn: listener): Command{
  if (this.hasWildCard() || this.hasParent()) {
    const name = this.generateEventName();
    emitter.on(name, (args, unknown)  => this.actionListener(fn, args, unknown));
    this._em2_events.push(name);
    if (this._alias){
      emitter.on(this._alias, (args,unknown) => this.actionListener(fn, args, unknown));
    }
  }
  else {
    this.baseAction(fn);
  }
  return this;
};
export = commander;
