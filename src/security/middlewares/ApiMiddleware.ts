import Request = Express.Request;
import { Response } from 'express';
import User from '../../models/User';
import * as passport from 'passport';

export class ApiMiddleware{
    public static handle(req: Request, res: Response, next: Function): any {
        const sendForbidden = (message: string) => {
            res.writeHead(403);
            res.write(message);
            res.end();
            return;
        };
        const callback = (err: any, user: User, info: any) => {
            if(err){
                switch (err.message) {
                    case "Forbidden":
                        return sendForbidden(err.message);
                }
                return next(err);
            }
            if(!user){
                return sendForbidden(info.message);
            }
            next();
        };
        passport.authenticate('api_auth', {session: false}, callback)(req,res,next);
    }
}