import { Container} from 'inversify';
import { DefaultResourceHandler } from './DefaultResourceHandler';
import { Manager } from '../container/Manager';
import { Kernel } from '../kernel/kernel';

declare let kernel: Kernel;
export class ResourceManager extends Manager{
    protected static getPath():string{
        return kernel.getConfig().resources_path;
    }

    public static async register(container: Container){
        const result = await super.register(container, true);
        container.bind(DefaultResourceHandler).toSelf();
        return result;
    }
}