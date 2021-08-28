import { ModelCtor } from 'sequelize';
import { BaseModel } from '../../models/BaseModel';

export interface IRelationInfo {
    foreignKeyAttr?: string,
    associationType: string,
    singular: string,
    plural: string,
    as: string,
    receivedAs: string,
    required: boolean,
    model: ModelCtor<any>,
    allowNull: boolean,
    values?: BaseModel<any>[],
    ids?: string[],
}