import { IResourceFields } from '../../serializer/interfaces/IResource';
import { IResponse } from '../../controller/interfaces/IResponse';
export interface ILinks {
    first: string;
    last: string;
    prev?: string;
    next?: string;
}
export interface IMeta {
    current: number;
    pages: number;
    total: number;
}
export interface IPaginationInfo<T>{
    rows?: Array<T>;
    error?: any,
    links?: ILinks;
    meta?: IMeta;
}
export interface IPagination<T> extends IResponse{
    included?:Array<IResourceFields>;
}

export interface IMultiPagination<T> extends IResponse{
    data: Array<IResourceFields>;
    included?:Array<IResourceFields>;
}