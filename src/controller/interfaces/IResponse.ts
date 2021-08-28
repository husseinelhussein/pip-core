import { IResourceFields } from '../../serializer/interfaces/IResource';
import { ILinks, IMeta } from '../../repositories/interfaces/IPagination';

export interface IResponse{
    data?:IResourceFields|Array<IResourceFields>|null
    errors?: Array<any>
    errorCode?: number;
    links?: ILinks,
    meta?: IMeta
}