import { BaseRepository } from './BaseRepository';
import { Kernel } from '../kernel/kernel';
import { Manager } from '../container/Manager';
import { StaticModel } from '../@types/model.t';
import { Container } from 'inversify';
import { DefaultRepository } from './DefaultRepository';
import { BaseModel } from '../models/BaseModel';
import { ModelManager } from '../models/ModelManager';


declare let kernel: Kernel;
export class RepositoryManager extends Manager{
    protected static getPath():string{
        return kernel.getConfig().repositories_path;
    }
    public static async register(container: Container, registerName?: boolean, collectOnly?: boolean){
        const res = await super.register(container, registerName, collectOnly);
        container.bind(DefaultRepository).toSelf();
        return res;
    }
    public static findRepository<T extends BaseModel>(model: string|StaticModel<T>):BaseRepository<T>{
        let repo: BaseRepository<T>;
        if (typeof model === 'string') {
            const name = model + "Repository";
            repo = this.getRepository(name);
        }
        else if(model.options && model.options.repository){
            repo = this.getRepository(model.options.repository, true);
        }
        else {
            const name = model.name + "Repository";
            repo = this.getRepository(name, false);
        }
        if(typeof  model === 'string'){
            repo.model = ModelManager.resolveModel(model);
        }
        else{
            repo.model = model;
        }
        return repo;

    }

    protected static getRepository(repository: string|typeof BaseRepository, fail?: boolean):BaseRepository<any>{
        let repo  = null;
        try {
            repo = kernel.getContainer().get(repository)
        }
        catch (e) {
            if(fail){
                let name = null;
                if(typeof repository === 'string'){
                    name = repository;
                }else{
                    name = repository.constructor.name;
                }
                throw Error(`Could not resolve repository name "${name}"`);
            }
            else{
                repo = kernel.getContainer().get(DefaultRepository);
            }
        }
        return repo;
    }
}