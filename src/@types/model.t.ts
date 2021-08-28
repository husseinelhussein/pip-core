import { BuildOptions } from 'sequelize';
import { BaseModel as OriginalModel } from '../models/BaseModel';

type NonAbstract<T> = {[P in keyof T]: T[P]}; // "abstract" gets lost here
type Constructor<T> = (new (values?: object, options?: BuildOptions) => T);
export type StaticModel<T> = Constructor<T> & NonAbstract<typeof OriginalModel>;