import { StaticModel } from "../@types/model.t";
import { BaseModel } from '../models/BaseModel';
import { DefaultRepository } from './DefaultRepository';
import { BaseRepository } from './BaseRepository';
import { RepositoryManager } from './RepositoryManager';

export function injectRepository<T extends BaseModel>(model: StaticModel<T>): Function{
  return (target: any, a:any,b:any) => {
    return "DefaultRepository";
  }
}
