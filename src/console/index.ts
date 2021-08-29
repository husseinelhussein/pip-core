import * as commander from "./utils/commander";
import { CommandManager } from './CommandManager';
import { Kernel } from '../kernel/kernel';
import { ErrorHandlerService } from '../services/ErrorHandlerService';
import { DatabaseService } from '../services/DatabaseService';
import getConfigFromArgs from "../helpers/ConfigHelper";
(async () => {
  const program = new commander.Command();
  program.version('0.0.1');
  program.allowUnknownOption(true);
  program.option('--config <value>', 'Configuration')
  const kernel = new Kernel();
  const config = getConfigFromArgs();
  if (config) {
    await kernel.setConfig(config);
  }
  await kernel.boot();
  const container = kernel.getContainer();
  /** Connect to Database */
  const db = container.get(DatabaseService);
  db.init();
  const connection = await db.connect().catch(console.log);
  if (!connection) {
    throw new Error("Failed to connect to database");
  }
  const errHandler = container.get(ErrorHandlerService);
  let err:any = null;
  await CommandManager.initCommands(program).catch(e => err = e);
  program.on("command:*", (args: any) => {
    const found = CommandManager.onUnknownCommand(program, args);
    if (!found) {
      if(process.send){
        process.send(false);
      }
      console.error('Invalid command: %s', program.args.join(' '));
      program.help();
      process.exit(1);
    }
  });
  if (err) {
    errHandler.handle(err);
    if (process.send) {
      process.send(err);
    }
  }
  await program.parseAsync(process.argv).catch(e => err = e);
  if (err) {
    if (process.send) {
      process.send({message: err.message, code: err.code | err});
    }
    if(typeof err === 'string'){
      console.error(err);
    }else if(typeof err === 'object' && err.hasOwnProperty('message')){
      throw err;
    }
  }
  else if (process.send) {
    process.send(true);
  }

})();

