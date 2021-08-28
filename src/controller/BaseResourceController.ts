import { Container, inject } from 'inversify';
import { Response,Request } from 'express';
import { BaseResource } from '../resources/BaseResource';
import { BaseRepository } from '../repositories/BaseRepository';
import { BaseController } from './BaseController';
import { ErrorHandlerService } from '../services/ErrorHandlerService';
import { QueryParser } from '../router/QueryParser';
import { DefaultResourceHandler } from '../resources/DefaultResourceHandler';
import { DefaultRepository } from '../repositories/DefaultRepository';

export abstract class BaseResourceController extends BaseController{
    protected repository: BaseRepository<any>;
    protected resourceHandler: BaseResource<any>;

    constructor(@inject(ErrorHandlerService) errorHandlerService: ErrorHandlerService,
                @inject(QueryParser) queryParser: QueryParser){
        super(errorHandlerService,queryParser);
        this.allowedFilters = ["query"];
    }
    async initialize(container:Container){
        await super.initialize(container);
        let name = this.constructor.name.replace('Controller',"Repository");
        try{
            this.repository = container.get(name);
        }catch (e) {
            console.log(`Could not resolve repository "${name}"`);
            this.errorHandler.handle(e);
            this.repository = container.get(DefaultRepository);
        }

        // Resolve resourceHandler:
        try{
            name = name.replace("Repository", "Resource");
            this.resourceHandler = container.get(name);
        }catch (e) {
            console.log(`Could not resolve resource handler "${name}"`);
            this.resourceHandler = container.resolve(DefaultResourceHandler);
        }
    }

    async index(req: Request, res: Response): Promise<any>{
        const pagination = await this.paginate(this.repository, this.resourceHandler);
        return pagination.send();
    }

    async view(req: Request, res: Response, id: string): Promise<any>{
        let errors = null;
        let options = null;
        try {
            options = this.getParams(this.repository);
        } catch (e) {
            return this.error(e).send(400);
        }
        const model = await this.repository.findById(id, options)
            .catch(e => {
                errors = e;
            });
        if(errors){
            return this.sendError(errors);
        }
        if(!model){
            return this.sendError(null,404);
        }
        const resource = this.resourceHandler.fromModel(model);
        return this.resource(resource).send();
    }

    async create(req: Request, res: Response): Promise<any>{
        let errors = null;
        const model = await this.repository.entityFromRequest(req)
            .catch(e => errors = e);
        if(errors){
            return this.sendError(errors,422);
        }
        // Save the model instance:
        const result = await this.repository.save(model, {validate: false}).catch((e: any) => errors = e);
        if(errors){
            return this.sendError(errors);
        }
        if(!result){
            const err = {
                message: "Failed to save resource",
            };
            return this.sendError(err);
        }
        const resource = this.resourceHandler.fromModel(result);
        return this.resource(resource).send(201);
    }

    async edit(req: Request, res: Response): Promise<any>{
        let errors:any = null;
        const model = await this.repository.entityFromRequest(req, true)
            .catch(e => errors = e);
        if(errors){
            return this.sendError(errors,422);
        }
        // update the model instance:
        await this.repository.save(model,{validate: false}).catch((e:any) => errors = e);
        if(errors){
            return this.sendError(errors);
        }
        //
        const resource = this.resourceHandler.fromModel(model);
        return this.resource(resource).send();
    }

    async remove(req: Request, res: Response, id: string): Promise<any>{
        let errors = null;
        const model = await this.repository.findById(id)
            .catch(e => {
                errors = e;
            });
        if(errors){
            return this.sendError(errors);
        }
        if(!model){
            return this.sendError(null,404);
        }
        // remove the model:
        await model.destroy().catch((e:any) => errors = e);
        if(errors){
            return this.sendError(errors);
        }
        return this.send(204);
    }

}