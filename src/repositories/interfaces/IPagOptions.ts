import { ModelCtor } from 'sequelize';
import { IResourceOptions } from './IResourceOptions';

export interface IRelationOption {
    model: ModelCtor<any>
    include?: IRelationOption[]
}
export interface IPagOptions extends IResourceOptions{
    page: number,
    size: number,
    filter: any,
}