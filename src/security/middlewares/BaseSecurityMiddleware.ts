import { Request, Response } from 'express';

export abstract class BaseSecurityMiddleware {
    public abstract handle(req: Request, res: Response, next: Function): any
}
