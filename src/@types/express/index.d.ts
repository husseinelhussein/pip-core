import * as express from "express"
declare global {
    namespace Express {
        interface Request {
            context: {
                id: number | string;
            };
            query: {
                [key: string]: any
            };
        }
    }
}
