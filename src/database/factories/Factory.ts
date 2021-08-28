import { FactoryManager } from './FactoryManager';
import { BaseFactory } from './BaseFactory';
import { StaticModel } from '../../@types/model.t';
import { BaseModel } from '../../models/BaseModel';

export class Factory {

    public static async generate<T extends BaseModel>(model: StaticModel<T>, count: number, save?: boolean):Promise<T[]>{
        const factory:BaseFactory<any> = FactoryManager.getFactory(model);
        const instances = <T[]> await factory.run(count);
        if(save){
            for(const instance of instances){
                let err = null;
                await instance.save().catch(e => err = e);
                if(err){
                    throw err;
                }
            }
        }
        return instances;
    }
}