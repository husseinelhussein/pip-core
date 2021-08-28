import { Container, interfaces } from 'inversify';
import { StaticModel } from '../@types/model.t';
import { Kernel } from '../kernel/kernel';
import { DatabaseService } from '../services/DatabaseService';
import { Manager } from '../container/Manager';
import { getOptions, getModelName, getModels, ModelCtor, SequelizeOptions } from 'sequelize-typescript';
import { RepositoryConstructor, TableOptions } from './interfaces/TableOptions';
import { DefaultRepository } from '../repositories/DefaultRepository';
import Context = interfaces.Context;
import { BaseRepository } from '../repositories/BaseRepository';

declare let kernel:Kernel;
export class ModelManager extends Manager{
    protected static getPath():string{
        return kernel.getConfig().models_path[0];
    }
    public static async register(container: Container){
        // 2. get it's associated repo by name
        // 3. or by its associated repo in the options.
        // 4. bind the model to the container with its repo as the tag
        const path = this.getPath();
        const config = kernel.getConfig();
        const options = <SequelizeOptions> config.db? config.db: {};
        options.models = config.models_path;
        const defaultModelMatch = (filename:any, member:any) => filename === member;

        // 1. get all models:
        const models = <StaticModel<any>[]>getModels([path],options.modelMatch || defaultModelMatch);
        // 2. map model name to a repo:
        for(const model of models){
            const modelName = getModelName(model.prototype);
            // 3. bind the model to the container with its repo as the tag
            container.bind("Repository").toDynamicValue((context: Context) => {
                const repo = this.getModelRepo(model);
                const resolvedRepo = <BaseRepository<any>>context.container.get(repo);
                resolvedRepo.model = model;
                return resolvedRepo;
            }).whenTargetNamed(modelName);
        }

        return [];

    }
    protected static getModelRepo(model:ModelCtor):RepositoryConstructor<any>{
        // 1. get the model options:
        const modelOptions = <TableOptions> getOptions(model.prototype);
        if (!modelOptions){
            throw new Error(`@Table annotation is missing on class "${model['name']}"`);
        }
        // 2. map the model to a repository:
        let repo:any = DefaultRepository;
        if(modelOptions.repository){
            repo = modelOptions.repository;
        }
        return repo;
    }

    public static resolveModel(name: string):StaticModel<any>{
        const db_ser = kernel.getContainer().get(DatabaseService);
        let model: StaticModel<any>|null = null;
        try {
            model = <StaticModel<any>>db_ser.getDatabase().modelManager.getModel(name);
        } catch (e) {
            //
        }
        if(model){
            return model;
        }else{
            throw Error(`Could not resolve model name "${name}"`);
        }
    }
}