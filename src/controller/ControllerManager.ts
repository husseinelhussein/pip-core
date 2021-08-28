import { Kernel } from '../kernel/kernel';
import { Manager } from '../container/Manager';

declare let kernel: Kernel;
export class ControllerManager extends Manager{
    protected static getPath():string{
        return kernel.getConfig().controllers_path;
    }
}