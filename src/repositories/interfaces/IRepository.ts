
// todo: get all public methods in Model and add them here:
import {
    CountOptions,
    CountWithOptions,
    CreateOptions,
    FindOptions,
    FindOrCreateOptions,
    Identifier,
    NonNullFindOptions,
    SaveOptions,
    UpdateOptions, UpsertOptions,
} from 'sequelize';
import {Promise as DBPromise} from 'sequelize';
import { BaseModel } from '../../models/BaseModel';

export interface IRepository<T> {
    findOne(options?:FindOptions): DBPromise<T|null>,

    findAll():DBPromise<T[]>,
    
    findAndCountAll(options?:FindOptions):Promise<any>,
    
    findByPk(identifier: Identifier, options: Omit<NonNullFindOptions, 'where'>): DBPromise<T|null>,

    findOrCreate(options: FindOrCreateOptions): DBPromise<[T, boolean]>;

    count(options?: CountOptions): DBPromise<number>;

    countOp(options: CountWithOptions): DBPromise<{ [key: string]: number }>;

    create(values?: object, options?: CreateOptions): DBPromise<T>

    update(values: object, options: UpdateOptions): DBPromise<[number, T[]]>;
    upsert<M extends BaseModel>(values: Object, options?: UpsertOptions & { returning?: false | undefined }): DBPromise<boolean>;
    save(model: T, options?: SaveOptions): Promise<T>;
}