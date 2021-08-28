import "reflect-metadata";
import { IBaseController } from './interfaces/IBaseController';
import { ErrorHandlerService } from '../services/ErrorHandlerService';
import { Container, inject } from 'inversify';
import { IResource, IResourceFields } from '../serializer/interfaces/IResource';
import { IPagination, IPaginationInfo } from '../repositories/interfaces/IPagination';
import { BaseResource } from '../resources/BaseResource';
import { BaseRepository } from '../repositories/BaseRepository';
import { IPagOptions } from '../repositories/interfaces/IPagOptions';
import { IResourceOptions } from '../repositories/interfaces/IResourceOptions';
import { QueryParser } from '../router/QueryParser';
import {Request, Response} from "express";

export abstract class BaseController implements IBaseController{
    protected errorHandler: ErrorHandlerService;
    protected request: Request;
    protected response: Response;
    protected allowedFilters: Array<string>;
    protected allowedRelations: Array<string>;
    private resourceItem:IResource | null;
    private resourcesItems:Array<IResourceFields>;
    private paginationInfo: IPaginationInfo<any>;
    private errorItem: any;
    private resourceSer: BaseResource<any>;
    protected queryParser: QueryParser;
    protected constructor(@inject(ErrorHandlerService) errorHandlerService: ErrorHandlerService,
                          @inject(QueryParser) queryParser: QueryParser){
        this.errorHandler = errorHandlerService;
        this.queryParser = queryParser;
        this.allowedFilters = [];
        this.allowedRelations = [];
    }

    async initialize(container:Container){}

    async onRequest(request: Request, response: Response){
        this.request = request;
        this.response = response;
        this.queryParser.setRequest(request);
        this.queryParser.setAllowedRelations(this.allowedRelations);
    }

    sendResponse(data?: any, statusCode = 200): any{
        if(data){
            return this.response.status(statusCode).json(data);
        }else{
            return this.response.status(statusCode).send();
        }
    }

    resource(resource: IResource):this{
        this.resourceItem = resource;
        return this;
    }

    resources(resources: Array<IResourceFields>):this{
        this.resourcesItems = resources;
        return this;
    }

    async paginate(repository: BaseRepository<any>,
                   resourceSer: BaseResource<any>,
                   currentPage?:number,
                   perPage?:number):Promise<this>{
        this.resourceSer = resourceSer;
        let errors: any;
        let params: any = null;
        try {
            params = this.buildPagParams(repository, currentPage, perPage);
        } catch (e) {
            errors = e;
        }
        if(errors){
            this.errorItem = errors;
            return this;
        }
        const pagination = <IPagination<any>>await repository.paginate(this.request, params)
            .catch((e: any) => errors = e);
        if(errors){
            this.errorItem = errors;
        }else{
            this.paginationInfo = pagination;
        }
        return this;
    }
    private buildPagParams(repository:BaseRepository<any>, currentPage?:number, perPage?:number): IPagOptions{
        let pageNumber = null;
        let size = null;
        let finalPage = 0;
        let finalSize = 10;
        const filter = this.getFilters();
        const relations = this.queryParser.getRelations(repository);
        if(this.request.query.page){
            pageNumber = parseInt((this.request.query.page as any).number);
            size = parseInt((this.request.query.page as any).size);
        }


        if(pageNumber){
            finalPage = pageNumber;
        }
        if(currentPage){
            finalPage = currentPage;
        }
        if(size){
            finalSize = size;
        }
        if(perPage){
            finalSize = perPage;
        }
        const options:IPagOptions = {
            page: finalPage,
            size: finalSize,
            filter: filter? filter: null,
        };
        if(relations){
            options.relations = relations;
        }
        return options;
    }

    protected getParams(repository:BaseRepository<any>):IResourceOptions|null{
        const relations = this.queryParser.getRelations(repository);
        const options: IResourceOptions = {
            relations: relations,
        };
        return options;
    }

    /**
     * Gets filter param from request and validate it
     */
    private getFilters(): any{
        if(!this.request.query.filter){
            return null;
        }
        const queryFilters = <any> this.request.query.filter;
        let allowed:Array<string> = [];

        // if the child controller does not specify allowed filters, return none:
        if (this.allowedFilters) {
            allowed = this.allowedFilters;
        }
        else {
            return null;
        }

        const passed:any = {};
        for(const key of Object.keys(queryFilters)){
            if(allowed.includes(key)){
                passed[key] = queryFilters[key];
            }
        }
        // make sure we return object only if it's filled:
        if(Object.keys(passed).length){
            return passed;
        }
        return null;
    }

    error(error: any):this{
        this.errorItem = error;
        return this;
    }

    send(statusCode = 200): any{
        let res:any = {};
        if(this.errorItem){
            res.errors = this.errorItem;
        }
        if(this.resourceItem){
            res = this.resourceItem;
        }
        if(this.resourcesItems){
            res = this.resourcesItems;
        }
        if(this.paginationInfo) {
            const pag = this.resourceSer.fromPagination(this.paginationInfo);
            if(pag){
                res = pag;
            }
            if(this.paginationInfo.error){
                res.errors = this.paginationInfo.error;
            }
        }
        if(Object.keys(res).length){
            return this.sendResponse(res,statusCode);
        }
        return this.sendResponse(null, statusCode);
    }

    sendError(error?: any, code = 500){
        let errors:Array<any> = [];
        if(error){
            if(Array.isArray(error)){
              errors = error;
            }else{
                errors.push(this.errorHandler.generateErrorResource(error));
            }
        }else if(code === 404){
            const err = {
                message: "Resource not found.",
                status: code
            };
            errors.push(err);
        }
        return this.error(errors).send(code);
    }

}