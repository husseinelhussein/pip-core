import { IRelationOption } from './IPagOptions';
import { FindOptions } from 'sequelize';

export interface IResourceOptions extends FindOptions{
    relations?: IRelationOption[]
}