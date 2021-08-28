export interface IFieldError {
    id?: string;
    links?: Array<{
        about: string
    }>
    status: number;
    code?: string;
    title: string;
    detail: string;
    source: {
        pointer: string;
        parameter?: string
    },
    meta?: any
}
export interface IEntityValError {
    entity: string;
    errors: Array<IFieldError>
}
export interface IAssociationInfo {
    value: any,
    attribute: string;
}