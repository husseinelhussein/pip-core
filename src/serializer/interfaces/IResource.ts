import { ModelCtor } from 'sequelize';
import { IResponse } from '../../controller/interfaces/IResponse';

export interface IRelationInfo {
    key: string,
    relationType: string,
    model:  ModelCtor<any>,
    values: any;
}
export interface IRelationId {
    id: string,
    type: string;
}
export interface IRelationResource {
    [key: string]: {
        data: IRelationId|IRelationId[]|null
    }
}

export interface IResourceFields{
    id: string;
    type: string;
    attributes: any;
    relationships?:IRelationResource;
}
export interface IResource extends IResponse{
    data?:IResourceFields|null,
    included?:Array<IResourceFields>
}