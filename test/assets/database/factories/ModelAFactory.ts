import { inject, injectable } from 'inversify';
import { BaseFactory } from '../../../../src/database/factories/BaseFactory';
import ModelA from '../../models/ModelA';
import { ModelBRepository } from '../../repositories/ModelBRepository';
import { random, name } from "faker";
@injectable()
export class ModelAFactory extends BaseFactory<ModelA>{
    modelBRepo: ModelBRepository;
    constructor(@inject(ModelBRepository) modelBRepo: ModelBRepository){
        super();
        this.modelBRepo = modelBRepo;
    }

    async generate(): Promise<ModelA> {
        const bs = await this.modelBRepo.findAll();
        const b = random.arrayElement(bs);
        const modelA = new ModelA();
        modelA.firstName = name.firstName();
        modelA.lastName = name.lastName();
        modelA.modelBId = b.id;
        return modelA;
    }
}