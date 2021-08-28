import * as express from "express"
declare module 'express'{
    interface Request {
        context: {
            id: number | string;
        };
        query: {
            [key: string]: any
        };
    }
}
