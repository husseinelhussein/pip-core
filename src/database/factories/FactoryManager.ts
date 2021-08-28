import { Kernel } from '../../kernel/kernel';
import { BaseFactory } from './BaseFactory';
import { StaticModel } from '../../@types/model.t';
import { BaseModel } from '../../models/BaseModel';
import { Manager } from '../../container/Manager';

declare let kernel: Kernel;
export class FactoryManager extends Manager{
    protected static getPath():string{
        return kernel.getConfig().factories_path;
    }
    public static getFactory<T extends BaseModel>(model: StaticModel<T>):BaseFactory<T>{
        const container = kernel.getContainer();
        let factory = <BaseFactory<any>> {};
        let name = null;
        if (model.options.modelName) {
            name = model.options.modelName;
        }
        else if(model.options.name && model.options.name.singular){
            name = model.options.name.singular;
        }
        else {
            name = model.name;
        }

        try {
            factory = container.get(name + "Factory");
        } catch (e) {
            throw Error('Could not find factory associated with this model:' + e.message);
        }
        return factory;
    }

}