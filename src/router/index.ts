import { Request, Router as OrRouter } from 'express';
import {readdirSync} from "fs";
import { BaseRouter } from './BaseRouter';
import { Container } from 'inversify';
import { IRouterOptions,IMiddleware,IRoute} from './interfaces/IRouteOptions';
import { BaseController } from '../controller/BaseController';
import { ErrorHandlerService } from '../services/ErrorHandlerService';
import { QueryParser } from './QueryParser';

export class Router{
    protected container: Container;
    protected routes_path: string;
    protected queryParser: QueryParser;
    constructor(container: Container, routes_path: string){
        this.container = container;
        this.queryParser = this.container.resolve(QueryParser);
        this.routes_path = routes_path
    }
    public static route(options:IRouterOptions): any{
        return (target: any) => {
            target['routes'] = options;
        }
    }
    public async init(){
        const routes = readdirSync(this.routes_path);
        const router = OrRouter();
        for(const _route of routes){
            if(!_route.endsWith('.ts') && !_route.endsWith('.js')){
                continue;
            }
            const route = await import(this.routes_path + '/' + _route);
            if(!route){
                throw new Error("Failed to load routes");
            }
            const name = Object.keys(route)[0];
            const routeObj = route[name];
            if(routeObj.prototype instanceof BaseRouter){
                await this.initializeRoute(router,routeObj.routes);
            }
        }
        return router;

    }
    protected async initializeRoute(router: OrRouter, options:IRouterOptions){
        // @todo: refactor the router initialization:
        if(options.groups){
            for(const group of options.groups){
                // register middle-wares:
                if(group.middleWares && group.middleWares.length){
                    for(const middleware of group.middleWares){
                        this.registerMiddleWare(router,group.base, middleware);
                    }
                }

                // register routes paths
                for(const route of group.routes){
                    const controller = this.getController(route.handler, options);
                    if(!controller){
                        throw new Error("Couldn't find a handler for route:" + route.path);
                    }
                    await this.registerRoute(router, route, group.base, controller);
                }
            }
        }
        else if(options.resource){
            // register middle-wares:
            if(options.middleWares && options.middleWares.length){
                for(const middleware of options.middleWares){
                    this.registerMiddleWare(router,options.resource, middleware);
                }
            }
            await this.registerResource(router,options.resource,options.controller);
        }
    }

    protected registerMiddleWare(router: OrRouter, base: string, middleWare: IMiddleware){
        router.use(base, middleWare.handle);
    }

    protected async registerResource(router: OrRouter, resource: string, controller: any){
        const routes: Array<IRoute> = [
            {
                path: "/",
                method: "get",
                handler: "index",
            },
            {
                path: "/",
                method: "post",
                handler: "create",
            },
            {
                path: "/:id",
                method: "patch",
                handler: "edit",
            },
            {
                path: "/:id",
                method: "get",
                handler: "view",
            },
            {
                path: "/:id",
                method: "delete",
                handler: "remove",
            },
        ];
        for(const route of routes){
            await this.registerRoute(router,route,resource,controller);
        }
    }
    protected async registerRoute(router: OrRouter, route: IRoute, base: string, controller: any){
        let path = route.path;
        if(base !== '/'){
            path = base + path;
        }
        switch (route.method) {
            case "all":
            case "get":
            case "post":
            case "put":
            case "delete":
            case "patch":
            case "options":
            case "head":
                router[route.method](path, async (req:Request ,res) => {
                    const instance:BaseController = this.container.get(controller.name);
                    await instance.initialize(this.container);
                    await instance.onRequest(req,res);
                    const params = this.getParams(req);
                    (instance as any)[route.handler](req,res,...params);
                });
                break;
            default:
                throw Error('HTTP method ' + route.method + ' is not supported');
        }
    }

    protected getParams(request: Request):any{
        const params = [];
        const requestParams = Object.keys(request.params);
        if(requestParams.length){
            for(const param of requestParams){
                const value = request.params[param];
                params.push(value);
            }
        }
        return params;
    }

    protected async initializeController(controller: any):Promise<any>{
        const dependencies = [
            ErrorHandlerService,
            QueryParser
        ];
        //
        const instance:any = this.container.resolve(controller);
        if(controller.prototype instanceof BaseController){
            const resolved:any = [];
            for(const dep of dependencies){
                const depA: any = dep;
                const resolvedDep = this.container.resolve(depA);
                if(resolvedDep){
                    resolved.push(resolvedDep);
                }
            }
            await instance.initialize(this.container, ...resolved);
        }
        return instance;
    }

    protected getController(methodName: string, options: IRouterOptions): BaseController|null{
        const handlers = Reflect.ownKeys(options.controller.prototype);
        for(const handler of handlers){
            if(handler === methodName){
                return <BaseController>options.controller;
            }
        }
        return null;
    }
}