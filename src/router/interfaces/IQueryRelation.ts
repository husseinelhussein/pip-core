export interface IQueryRelation {
    name: string
    parent?: string
    children?: IQueryRelation[]
    exists: boolean;
    allowed: boolean;
}