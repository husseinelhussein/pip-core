import { BaseUnitTest } from '../BaseUnitTest';
import { resolve } from "path";
import { Kernel } from '../../../src/kernel/kernel';
import { ForkOptions } from "child_process";
import * as cp from "child_process";
import * as commander from "../../../src/console/utils/commander"

export class BaseCommandTest extends BaseUnitTest{
  async before(){
    await this.init(false, false);
  }

  /**
   * Calls a console command.
   * @param args
   */
  callCommand(args: any[]): Promise<any>{
    return new Promise(async (res, reject) => {
      const path = resolve(Kernel.getRoodDir(), './src/console');
      const options: ForkOptions = {
        silent: false,
        execArgv: ['-r', 'ts-node/register','--inspect'],
        env: process.env,
      };
      const appArgs = [
          '--config=' + resolve(__dirname, './../../assets/env/lib_test.config')
      ];
      args = args.concat(appArgs);
      const child = cp.fork(path, args, options);
      child.on('error', (err) => {
        reject(err);
      })
      child.once('message', (message:any, sendHandle) => {
        const isBoolean = typeof message === 'boolean';
        if(isBoolean && message){
          res(message);
        }
        else {
          reject(message);
        }
      });

    });
  }

  initCommander():commander.Command{
    const command = new commander.Command();
    command.version('0.0.1');
    return command;
  }
}