import { ModelCtor } from 'sequelize';

export interface IEntityValResult {
    valid: boolean;
    value: ModelCtor<any>|null,
    attribute?: string;
    errors?: any;
}