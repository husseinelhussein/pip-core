import { BaseTest } from '../BaseTest';
import { BaseRepository } from '../../src/repositories/BaseRepository';
import { ErrorHandlerService } from '../../src/services/ErrorHandlerService';
import { Serializer } from '../../src/serializer/Serializer';
import { DatabaseService } from '../../src/services/DatabaseService';
import { Request } from 'express';
import { instance, mock, when, spy, anything } from 'ts-mockito';
import { Sequelize } from 'sequelize-typescript';
import ModelA from '../assets/models/ModelA';
import { ModelARepository } from '../assets/repositories/ModelARepository';
import { IMultiPagination } from '../../src/repositories/interfaces/IPagination';
import { resolve } from "path";

export class BaseUnitTest extends BaseTest{
    serializer: Serializer;
    assets_path = __dirname + "/../assets";
    initRepo():BaseRepository<any>{
        const errorHandler: ErrorHandlerService = this.container.get(ErrorHandlerService);
        const serializer: Serializer = this.container.get(Serializer);
        const dbService = this.container.get(DatabaseService);
        const repo = new ModelARepository(this.container, errorHandler,serializer, dbService);
        this.serializer = serializer;
        return repo;
    }

    mockDatabaseService():DatabaseService{
        return this.spyDbService();
    }

    spyDbService():DatabaseService{
        const service = this.container.get(DatabaseService);
        const spiedService = spy(service);
        const db = this.spyDatabase(service);
        when(spiedService.init()).thenCall(() => {
           const stop = null;
        });
        when(spiedService.getDatabase()).thenReturn(db);
        return service;
    }
    spyDatabase(service: DatabaseService):Sequelize{
        const db = service.getDatabase();
        const spiedDb = spy(db);
        const manager = this.spyModelManager(db);
        when(spiedDb.modelManager).thenReturn(manager);
        return db;
    }
    spyModelManager(db: Sequelize){
        const manager = db.modelManager;
        const spiedManager = spy(manager);
        const model = this.mockModel();
        when(spiedManager.getModel(anything())).thenCall(() => {
            console.log('returned a mock model');
            return model;
        });
        return manager;
    }

    mockModel(){
        // todo: mock the relations
        const model = new ModelA();
        const spiedModel = spy(model);
        return model;
    }


    mockRepo(repo: BaseRepository<any>){
        const spiedRepo = spy(repo);
        const findRes = {
            count: 1,
            rows: [{
                firstName: "John",
            }]
        };
        when(spiedRepo.findAndCountAll(anything())).thenResolve(findRes);
        when((spiedRepo as any).getAttributes()).thenReturn(['firstName']);
        return repo;
    }

    mockRequest(url?: string|null, body?: any):Request{
        const requestMock: Request = mock({});
        let _url = 'http://localhost/api';
        if(url){
            _url = url;
        }
        when(requestMock.originalUrl).thenReturn(_url);
        if(body){
            const _body = {
                data: body,
            };
            when(requestMock.body).thenReturn(_body);
        }
        return instance(requestMock);
    }

    getDataDump(d_path: string):IMultiPagination<any>{
        const path = resolve(this.assets_path + "/" + d_path + ".json");
        return require(path);
    }

    getResource(path: string):string[]{
        const resource:string[] = [];
        path = path.replace('http://localhost/api','');
        path = path.replace('?range=1','');
        const res = path.split('/');
        if(res.length === 2){
            resource.push(res[1]);
        }
        else if(res.length === 3){
            resource.push(res[1]);
            resource.push(res[2]);
        }
        return resource;
    }
}