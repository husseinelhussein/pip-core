import * as express from "express"
import {ParsedQs} from "qs";
declare global {
    namespace Express {
        interface Request {
            context: {
                id: number | string;
            };
            query: ParsedQs | {
                [key: string]: any
            };
        }
    }
}
