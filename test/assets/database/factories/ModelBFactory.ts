import { injectable } from 'inversify';
import { BaseFactory } from '../../../../src/database/factories/BaseFactory';
import ModelB from '../../models/ModelB';
import {address} from "faker";
@injectable()
export class ModelBFactory extends BaseFactory<ModelB>{
    async generate(): Promise<ModelB> {
        const modelB = new ModelB();
        modelB.address_a = address.streetAddress();
        modelB.address_b = address.streetAddress();
        return modelB;
    }
}