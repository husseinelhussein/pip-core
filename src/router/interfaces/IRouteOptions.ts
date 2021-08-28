import { Request, Response } from 'express';

export interface IRoute {
    path: string,
    method: string,
    handler: string
}
export interface IMiddleware {
    handle(req: Request, res: Response, next: Function): any
}

export interface IRouteGroup {
    middleWares?: Array<IMiddleware>,
    base: string,
    routes: Array<IRoute>
}
export interface IRouterOptions {
    controller: any,
    resource?: string,
    relationResource?: boolean,
    middleWares?: Array<IMiddleware>,
    groups?: Array<IRouteGroup>
}