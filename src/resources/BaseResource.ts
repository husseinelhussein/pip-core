import { IResourceFields, IResource } from '../serializer/interfaces/IResource';
import { Container, inject } from 'inversify';
import { ErrorHandlerService } from '../services/ErrorHandlerService';
import { BaseModel } from '../models/BaseModel';
import { IPagination, IPaginationInfo } from '../repositories/interfaces/IPagination';
import { Serializer } from '../serializer/Serializer';

export abstract class BaseResource<Model extends BaseModel>{
    public constructor(@inject(Container) protected container: Container,
                       @inject(Serializer) public serializer: Serializer,
                       @inject(ErrorHandlerService) protected errorHandler: ErrorHandlerService){}

    public getValues(model: Model): any{
        return this.serializer.getValues(model);
    }

    public fromPagination(data: IPaginationInfo<Model>):IPagination<Model>|null{
        return this.serializer.paginate(data);
    }

    public fromModel(model: Model):IResource{
        return this.serializer.serializeModel(model);
    }

    public createMany(models: Array<Model>):Array<IResourceFields>{
        return this.serializer.createMany(models);
    }
}
