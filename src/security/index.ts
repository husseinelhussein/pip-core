import * as passport from "passport";
import { ApiStrategy } from './strategies/ApiStrategy';
import { Express } from 'express';
import { PassportStatic } from 'passport';
import { readdirSync } from "fs";
import { IDefaultStrategy } from './interfaces/IDefaultStrategy';
export class Security {
    protected app: Express;
    protected strategies_path = __dirname + "/../../security/strategies";
    constructor(app: Express){
        this.app = app;
    }
    public async init(){
        // 1- load all strategies from the lib
        // 2- load the user defined strategies inside /src
        const defaultStrategies = this.getDefaultStrategies();
        for(const strategy of defaultStrategies){
            // initialize it:
            const str = new strategy.source();
            passport.use(strategy.name, str.getStrategy());
        }
        await this.loadStrategies(passport);
        // finally initialize passport:
        this.app.use(passport.initialize());
    }
    protected getDefaultStrategies(): Array<IDefaultStrategy>{
        return [
            {
                name: "api_auth",
                source: ApiStrategy
            }
        ];
    }
    protected async loadStrategies(passport: PassportStatic){
        try{
            const files = readdirSync(this.strategies_path);
            for(const file of files){
                if(!file.endsWith('.ts') && !file.endsWith('.js')){
                    continue;
                }
                const strategy = await import(this.strategies_path + '/' + file).catch(console.log);
                const constructorName = Object.keys(strategy)[0];
                const instance = new strategy[constructorName]();
                passport.use(instance.getName,instance.getStrategy);
            }
        }catch (e) {
            console.log('Could not load additional strategies');
        }
    }
}
