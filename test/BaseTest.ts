import { Kernel } from '../src/kernel/kernel';
import {Express as ExpressApp } from "express";
import * as request from 'supertest';
import { Container } from 'inversify';
import { DatabaseService } from '../src/services/DatabaseService';
import { Sequelize } from 'sequelize-typescript';
import { MigrationCommand } from '../src/console/app-commands/db/MigrationCommand';
import seeder from '../src/database/listener/SeedListener';
import { expect } from 'chai';
import * as path from "path";
import {IAppConfig} from "../src/kernel/interfaces/IAppConfig";
export class BaseTest {
    protected app: ExpressApp;
    protected client: request.SuperTest<request.Test>;
    protected token: string;
    protected container: Container;
    protected kernel: Kernel;
    protected appPort: any;
    protected appUser: string;
    protected appPassword: string;
    public constructor(){}

    async init(listen?: boolean, connectDB?:boolean, migrate?:boolean, env?: string, drop?: boolean, config?:IAppConfig):Promise<any>{
        return new Promise<any>(async (resolve,reject) => {
            const kernel = new Kernel();
            if(!config){
                const defaultConfig:IAppConfig = require(path.resolve(__dirname, './assets/env/default.config'));
                const testConfig:IAppConfig = require(path.resolve(__dirname, './assets/env/lib_test.config'));
                config = <IAppConfig> Object.assign(defaultConfig, testConfig);
            }
            kernel.setConfig(config);
            const app = await kernel.boot(config.env);
            this.kernel = kernel;
            this.client = request(app)
            this.appPort = process.env.PORT || 5000;
            this.appUser = process.env.APP_USERNAME || "john@example.com";
            this.appPassword = process.env.APP_PASSWORD || "test";
            if (app && listen) {
                app.listen(this.appPort, () => {
                    console.log(`API listening on port ${this.appPort}`);
                    this.app = app;
                    this.container = kernel.getContainer();
                });
            }
            else if (app) {
                this.app = app;
                this.container = kernel.getContainer();
            }
            else {
                console.log('Failed to start api');
                reject();
            }

            if(connectDB){
                await this.connectToDb(migrate, env, drop);
            }
            resolve(true);
        });
    }

    async connectToDb(migrate?:boolean, env?: string, drop?: boolean){
        /** Connect to Database */
        const db_ser:DatabaseService = this.kernel.getContainer().get(DatabaseService);
        db_ser.init();
        const db = <Sequelize> await db_ser.connect().catch(console.log);
        if (db) {
            if (migrate) {
                const migrationCommand = this.container.get(MigrationCommand);
                let err = null;
                // drop tables only in test env:
                if(drop && env && (env === "test" || env === "development")) {
                    await db_ser.getDatabase().getQueryInterface().dropAllTables();
                    //await migrationCommand.run(null,{direction:"down"}).catch(e => err = e);
                }
                if (err) {
                    throw err;
                }
                await migrationCommand.run(null,{direction:"up", confirm: true}).catch(e => err = e);
                if (err) {
                    throw err;
                }
            }
        }
        else {
            throw new Error("Failed to connect to database");
        }
    }

    async seed(){
        const dbService = this.container.get(DatabaseService);
        const queryInterface = dbService.getDatabase().getQueryInterface();
        let err = null;
        await seeder.up(queryInterface);
        expect(err).to.be.null;
    }
    async login(){
        const response = await this.client
            .post('/login')
            .set("Content-type", "application/json")
            .send({ email: this.appUser, password: this.appPassword});
        this.token = response.body.access_token;
        return true;
    }
}
