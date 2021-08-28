import corsMiddleware from '../middleware/cors';
import { formBodyParserMiddleware, jsonBodyParserMiddleware } from '../middleware/bodyParser';
import morganMiddleware from '../middleware/morgan';
import * as path from "path";
import {ContainerLoader} from '../container/ContainerLoader';
import { Security } from '../security';
import { Router } from '../router';
import { HttpError } from '../helpers/HttpError';
import errorMiddleware from '../middleware/error';
import {Express, Request, Response } from 'express';
import * as App from 'express';
import { Container } from 'inversify';
import { AppConfig } from './AppConfig';
import { IAppConfig } from './interfaces/IAppConfig';

declare let kernel: Kernel;
export class Kernel {
    protected app: Express;
    protected container: Container;
    protected config: IAppConfig;

    public setConfig(config: IAppConfig| any){
        process.env.APP_ENV = config.env;
        this.config = config;
    }
    public async boot(env?:string):Promise<Express>{
        if (!this.config) {
            this.config = new AppConfig(env);
        }
        const gb: any = global;
        gb.kernel = this;
        const app = App();
        app.use(corsMiddleware);
        app.use(formBodyParserMiddleware);
        app.use(jsonBodyParserMiddleware);
        app.use(morganMiddleware);

        /** Register services,repositories..etc: */
        const con = await ContainerLoader.register();

        /** Load Security middlewares */
        const security = new Security(app);
        await security.init();

        /** Load application routes */
        const router = new Router(con, this.config.routes_path);
        const routes = await router.init().catch(console.log);
        if(routes){
            app.use(routes);
        }else{
            throw new Error("Failed to load routes");
        }

        /** Return 404 for requested resources not found */
        app.use((req:Request, res:Response) => {
            throw new HttpError(404);
        });
        /** Load error middleware */
        app.use(errorMiddleware);
        this.app = app;
        this.container = con;
        gb.kernel = this;
        return app;
    }
    public static getRoodDir():string{
        let p = path.resolve(__dirname, '../../');
        p = p.replace(/(?:\\|\/)built(?:\\|\/)kernel/g,'');
        return p;
    }

    public getApp():Express{
        return this.app;
    }

    public getContainer():Container{
        return this.container;
    }

    public getConfig():IAppConfig{
        return this.config;
    }

    public static getKernel():Kernel{
        return kernel;
    }
}