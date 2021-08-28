import { BaseModel } from '../../models/BaseModel';

export abstract class BaseFactory<T extends BaseModel>{

    /**
     * A hook to generate instances of the model
     * @returns Array<T>: the instances.
     */
    public abstract async generate(): Promise<T>;

    /**
     * Generates a number of unsaved instances and returns them.
     *
     * @param items
     */
    public async run(items: number):Promise<T[]>{
        let count = 0;
        const models:T[] = [];
        while(count < items){
            count++;
            const model = await this.generate();
            models.push(model);
        }
        return models;
    }
}
