import { IRepository } from './interfaces/IRepository';
import { BaseModel as OriginalModel } from '../models/BaseModel';
import {
    CountOptions,
    CountWithOptions,
    CreateOptions,
    FindOptions,
    FindOrCreateOptions,
    HasOne,
    HasOneOptions,
    Identifier,
    ModelCtor,
    NonNullFindOptions,
    Promise as DBPromise,
    SaveOptions,
    UpdateOptions,
    UpsertOptions,
} from 'sequelize';
import { Container, inject} from 'inversify';
import { ValidationOptions } from 'sequelize/types/lib/instance-validator';
import { ErrorHandlerService } from '../services/ErrorHandlerService';
import { IFieldError} from './interfaces/IEntityValError';
import { IFCResult } from './interfaces/IFCResult';
import { IResourceOptions } from './interfaces/IResourceOptions';
import { Serializer } from '../serializer/Serializer';
import { IDeSerialized} from '../serializer/interfaces/IDeSerialized';
import { DatabaseService } from '../services/DatabaseService';
import { StaticModel } from '../@types/model.t';
import { ModelManager } from '../models/ModelManager';

export abstract class Repository<T extends OriginalModel> implements IRepository<T>{
    model: StaticModel<T>;
    protected container: Container;
    protected errorHandler: ErrorHandlerService;
    protected serializer: Serializer;
    protected databaseService: DatabaseService;
    public constructor(@inject(Container) container: Container,
                       @inject(ErrorHandlerService) errHandler: ErrorHandlerService,
                       @inject(Serializer) serializer: Serializer,
                       @inject(DatabaseService) databaseService: DatabaseService
    ){
        this.container = container;
        this.errorHandler = errHandler;
        this.serializer = serializer;
        this.databaseService = databaseService;
        const name = this.constructor.name.replace("Repository","");
        try {
            this.model = <StaticModel<T>>ModelManager.resolveModel(name);
        } catch (e) {
            //
        }
    }

    findOne(options?: FindOptions): DBPromise<T | null> {
        return this.model.findOne(options);
    }

    async findOneOrFail(options?: FindOptions): Promise<T> {
        const item  = <T> await this.model.findOne(options);
        if(!item){
            throw new Error(`No results found for model "${this.model.name}"`);
        }
        return item;
    }

    findAll(options?:FindOptions): DBPromise<T[]> {
        return this.model.findAll(options);
    }

    findAndCountAll(options?:FindOptions): DBPromise<IFCResult<T>> {
        return this.model.findAndCountAll(options);
    }
    findByPk(identifier: Identifier, options: Omit<NonNullFindOptions, 'where'>): DBPromise<T|null>{
        return this.model.findByPk(identifier,options);
    }

    findById(identifier: string, options?: IResourceOptions|null): DBPromise<T|null>{
        let op: IResourceOptions = {};
        if (options) {
            op = options;
        }
        op.where = {
            id: identifier
        };
        if(options && options.relations && options.relations.length){
            op.include = [];
            for(const relation of options.relations){
                op.include.push(relation.model);
            }
        }
        return this.model.findOne(op);
    }

    findOrCreate(options: FindOrCreateOptions): DBPromise<[T, boolean]>{
        return this.model.findOrCreate(options);
    }

    count(options?: CountOptions): DBPromise<number>{
        return this.model.count(options);
    }

    countOp(options: CountWithOptions): DBPromise<{ [key: string]: number }>{
        return this.model.count(options);
    }
    protected getAttributes():Array<string>{
        const model: OriginalModel<T> = new this.model();
        return model.getVisibleAttributes();
    }

    async validate<M extends OriginalModel>(instance: M, data: IDeSerialized, options?: ValidationOptions): Promise<any>{
        let errors:Array<any> = [];
        const attrResult = this.validateAttributes(instance, data);
        if(Array.isArray(attrResult)){
            errors = attrResult;
        }
        const result = await instance.validate(options).catch((e:any) => {
            const addErrors = this.filterErrorMessage(e);
            errors = errors.concat(addErrors);
        });
        if(errors && errors.length){
            throw errors;
        }
        return result;
    }

    /**
     * Validates attributes against the model attributes.
     *
     * @param model
     * @param data
     */
    validateAttributes<M extends OriginalModel>(model: M, data: IDeSerialized):boolean|Array<IFieldError>{
        const errors:Array<IFieldError> = [];
        let attributes:Array<string> = Object.keys(data);
        const modelAttributes:Array<string> = Object.keys(this.model.rawAttributes);
        const allowedAttributes:Array<string> = model.allowedAttributes;
        const associationsAttributes: Array<string> = [];
        const associations = this.model.associations;
        const allowUnknown = model.allowUnknownAttributes;
        const err: IFieldError = {
            title: "Attribute is not allowed",
            detail:"Attribute is not allowed",
            status: 422,
            source: {
                pointer: "",
            },
            meta: {
                field: null,
            }
        };
        // Skip validating attributes if allowUnknown is true
        if(allowUnknown){
            return true;
        }
        // collect all the associations fields:
        for(const assoc of Object.keys(associations)){
            associationsAttributes.push(associations[assoc].identifier);
        }
        // remove relationships attribute if found:
        attributes = attributes.filter(item => {
            return item !== 'relationships'
        });
        // start validating:
        for(const attribute of attributes){
            let forbidden = false;
            if( associationsAttributes.includes(attribute)){
                // forbid if the attribute is an association:
                forbidden = true;
            }else if(!allowedAttributes.includes(attribute) && !allowedAttributes.includes("*all*")){
                // forbid if the attribute is not allowed:
                forbidden = true;
            }else if(!modelAttributes.includes(attribute)){
                // forbid if the attribute is not defined in the model:
                forbidden = true;
            }
            if(forbidden){
                err.source.pointer = "data/attributes/" + attribute;
                err.meta.field = attribute;
                errors.push(err);
            }
        }
        if(errors.length){
            return errors;
        }
        return true;
    }
    create(values: object, options?: CreateOptions): DBPromise<T>{
        return new DBPromise((resolve, reject) => {
            this.model.create(values,options)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    const res = this.filterErrorMessage(err);
                    reject(res);
                })
        });
    }
    protected filterErrorMessage(err: any): Array<IFieldError>{
        const enErrors: Array<IFieldError> = [];
        if (err.errors !== undefined && err.name === "SequelizeValidationError") {
            for (const error of err.errors) {
                const enErr: IFieldError = {
                    status: 422,
                    title: error.message,
                    detail: error.message,
                    source: {
                        pointer: "data/attributes/" + error.path
                    }
                };
                enErrors.push(enErr);
            }
        }
        else {
            // todo: handle other @types of errors:
        }
        return enErrors;
    }

    update(values: object, options: UpdateOptions): DBPromise<[number, T[]]>{
        return this.model.update(values,options);
    }

    async save(model: T, options?: SaveOptions): Promise<T>{
        return  model.save(options);
    }

    upsert<M extends OriginalModel>(values: Object, options?: UpsertOptions & { returning?: false | undefined }): DBPromise<boolean> {
        return this.model.upsert(values,options);
    }

    hasOne<B extends OriginalModel>(
        target: ModelCtor<B>, options?: HasOneOptions
    ): HasOne<T,B>{
        return this.model.hasOne(target,options);
    }


}