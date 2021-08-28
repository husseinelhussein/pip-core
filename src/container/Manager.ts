import { readdir } from 'fs';
import { Container } from 'inversify';
import { BaseService } from '../services/BaseService';

export abstract class Manager{
  protected static getPath(): string{
    return "";
  }
  /**
   * Gets the files names in the directories to register.
   * @param path
   */
  protected static getFiles(path: string):Promise<string[]>{
    return new Promise<any[]>((res, reject) => {
      readdir(path, (err: any, files: string[]) => {
        if(err){
          reject(err);
          return;
        }
        res(files);
      })
    })
  }


  /**
   * Loads and registers services
   *
   * @param container Container: The container.
   * @param registerName
   * @param collectOnly
   * @param singleton
   */
  public static async register(container: Container, registerName?: boolean, collectOnly?: boolean, singleton?: boolean){
    const files = await this.getFiles(this.getPath());
    const registered:any[] = [];
    for (const file of files) {
      if(!file.endsWith('.ts') && !file.endsWith('.js')){
        continue;
      }
      const clsObj = await import(this.getPath() + '/' + file).catch(console.log);
      const constructorName = Object.keys(clsObj)[0];
      if (clsObj[constructorName].prototype instanceof BaseService) {
        singleton = clsObj[constructorName].isSingleton();
      }
      if(!collectOnly){
        if(singleton){
          container.bind(clsObj[constructorName]).to(clsObj[constructorName]).inSingletonScope();
        }else{
          container.bind(clsObj[constructorName]).to(clsObj[constructorName]);
        }
        if(registerName){
          if(singleton){
            container.bind(constructorName).to(clsObj[constructorName]).inSingletonScope();
          }else{
            container.bind(constructorName).to(clsObj[constructorName]);
          }
        }

      }
      registered.push(clsObj[constructorName]);
    }
    return registered;
  }
}