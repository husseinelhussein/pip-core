import { ICommandConfig } from '../../interfaces/ICommandConfig';
import { injectable } from 'inversify';
import { exec } from 'child_process';
import { resolve } from "path";
import { Kernel } from '../../../kernel/kernel';
import { BaseSequelizeCommand } from './BaseSequelizeCommand';

@injectable()
export class OtherDbCommand extends BaseSequelizeCommand{

  getName(): string {
    return "db:*";
  }

  init(): ICommandConfig {
    return {
      description: "A wrapper for other db commands",
      allowUnknownOptions: true,
      passOptionsAsObject: true,
      usage: "",
      questions: [
        {
          type: "list",
          name: "confirm",
          message: "Are you sure you want to continue?",
          choices: [
            'Yes',
            'No'
          ],
          default: "Yes",
        }
      ],
    };
  }

  showPrompt(config: ICommandConfig, options:any|string[], called_command?:string): boolean {
    // to ignore if the command in the list:
    const ignorable:string [] = [
        'db:migrate:status',
    ];

    if(called_command && ignorable.includes(called_command)){
      return false;
    }
    return true;
  }

  run(args:any|string[],options:any, called_command?:string): Promise<any> {
    return new Promise<any>((res,reject) => {
      if(options.answers.confirm === 'No'){
        res();
        return;
      }
      let command = "";
      if(called_command){
        command = called_command
      }
      let optionKeys = Object.keys(options);
      optionKeys = optionKeys.filter((item) => {
        return item !== "interactive" && item !== 'answers';
      });
      for(let i=0; i < optionKeys.length; i++){
        const key = optionKeys[i];
        const val = options[key];
        if(key === 'name'){
          command += val;
        }else if(i < optionKeys.length){
          command += " " + key + "=" + val;
        }else{
          command += key + "=" + val;
        }
      }
      const seq_path = './node_modules/sequelize-cli/lib/sequelize';
      const path = resolve(Kernel.getRoodDir(), seq_path);
      console.log('Executing ' + seq_path + " " + command);
      exec('node '+ path + " " + command ,((error:any, stdout:string, stderr:string) => {
        if(stdout){
          console.log(stdout);
        }
        if(error || stderr){
          let message = null;
          if(stderr){
            message = stderr;
          }else{
            message = error.message;
          }
          reject(message);
        }else{
          res();
        }
      }))
    });
  }
}