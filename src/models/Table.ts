import { TableOptions } from './interfaces/TableOptions';
import { setModelName,addOptions } from 'sequelize-typescript';
import { RepositoryManager } from '../repositories/RepositoryManager';
export function Table(options: TableOptions):Function{
  const op = Object.assign({}, options);
  return (target:any) => {
    setModelName(target.prototype, options.modelName || target.name);
    addOptions(target.prototype, options);
    // 1. find the repository
    // 2. assign it to the model
    //const repo = RepositoryManager.findRepository(target);
    //repo.model = target;
    const stopt = null;
  };
}

function annotate(){

}
