import { injectable } from 'inversify';
import { BaseFactory } from '../../../../src/database/factories/BaseFactory';
import ModelC from '../../models/ModelC';

@injectable()
export class ModelCFactory extends BaseFactory<ModelC>{
    async generate(): Promise<ModelC> {
        const modelC = new ModelC();
        return modelC;
    }
}