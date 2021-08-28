import { Container } from 'inversify';
import { DatabaseService } from './DatabaseService';
import { ErrorHandlerService } from './ErrorHandlerService';
import { UmzugService } from './UmzugService';
import { Kernel } from '../kernel/kernel';
import { Manager } from '../container/Manager';

declare let kernel: Kernel;
export class ServiceManager extends Manager {
  protected static getPath():string{
    return kernel.getConfig().services_path;
  }
  public static async register(container: Container){
    const services = await super.register(container);
    // Register database service:
    container.bind(DatabaseService).toSelf().inSingletonScope();

    // Register error handler service:
    container.bind(ErrorHandlerService).toSelf();

    // Register Umzug service:
    container.bind(UmzugService).toSelf();
    return services;
  }
}