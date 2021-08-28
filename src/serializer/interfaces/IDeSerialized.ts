import { IRelationId } from './IResource';

export interface IRelationIdB extends IRelationId{
    name: string,
}
export interface IRelationLinks {
    self: string;
    related: string;
}
export interface IRelationshipsData {
    data: IRelationIdB|Array<IRelationIdB>;
    links?: IRelationLinks;
}
export interface IRelationships {
    [key: string]: IRelationshipsData;
}
export interface IDeSerialized {
    [key: string]: any,
    relationships?: IRelationships,
}