import { BaseUnitTest } from '../BaseUnitTest';
import { suite,test } from "@testdeck/mocha";
import { Request} from "express";
import { ILinks, IMeta, IPaginationInfo } from '../../../src/repositories/interfaces/IPagination';
import { expect } from "chai";
import { anything, spy, when } from 'ts-mockito';
import { IResourceFields } from '../../../src/serializer/interfaces/IResource';
import { IDeSerialized } from '../../../src/serializer/interfaces/IDeSerialized';
import { IAssociationInfo } from '../../../src/repositories/interfaces/IEntityValError';
import { BuildOptions } from 'sequelize';
import {UserRepository} from "../../../src/repositories/UserRepository";
import ModelA from '../../assets/models/ModelA';
import { ModelARepository } from '../../assets/repositories/ModelARepository';
import ModelB from '../../assets/models/ModelB';

// todo: fix failed tested due to the changes
@suite
class BaseRepositoryTest extends BaseUnitTest{

    async before(): Promise<any>{
        await this.init(false, true, true, 'lib_test');
    }

    @test
    async paginate():Promise<any>{
        const repo = this.initRepo();
        const spiedRepo = spy(repo);
        const findRes = {
            count: 1,
            rows: [{
                firstName: "John Doe",
            }]
        };
        when(spiedRepo.findAndCountAll(anything())).thenResolve(findRes);
        when((spiedRepo as any).getAttributes()).thenReturn(['firstName']);
        const request: Request = this.mockRequest();
        let res = await repo.paginate(request);
        // assert that the result is valid:
        expect(res).to.be.an("object", "Result should be object");
        expect(res.rows).to.be.an("array", "rows should be array");
        expect(res.rows).to.length(1,"result length should be 1");
        expect(res.rows).equal(findRes.rows, "first row should be valid");
        const err = {
            name: "Dummy Error",
            message: "This is a dummy error",
        };
        // assert that the result is error
        when(spiedRepo.findAndCountAll(anything())).thenReject(err);
        res = await repo.paginate(request);
        expect(res).to.not.have.property("rows");
        expect(res).to.not.have.property("meta");
        expect(res).to.not.have.property("links");
        expect(res.error).to.have.property("title");
        expect(res.error).to.have.property("detail");
        expect(res.error).to.have.property("status");
        expect(res.error).to.have.property("source");
    }

    @test
    buildResource(){
        const repo = this.initRepo();
        const request: Request = this.mockRequest();
        const findRes = {
            count: 1,
            rows: [{
                firstName: "John Doe",
            }]
        };
        const res = <IPaginationInfo<any>>(repo as any).buildResource(request,findRes,0,10);
        expect(res).to.have.property("rows");
        expect(res).to.have.property("meta");
        expect(res).to.have.property("links");
    }

    @test
    buildMeta(){
        const repo = this.initRepo();
        const res:IMeta = (repo as any).buildMeta(1, 0, 10);
        expect(res).to.have.property("current").that.equal(1);
        expect(res).to.have.property("pages").that.equal(1);
        expect(res).to.have.property("total").that.equal(1);
    }

    @test
    buildLinks(){
        const repo = this.initRepo();
        const request = this.mockRequest();
        let res:ILinks = (repo as any).buildLinks(request, 0, 10, 20);
        expect(res).to.have.property("first");
        expect(res).to.have.property("last");
        expect(res).to.not.have.property("prev");
        res = (repo as any).buildLinks(request, 2, 10, 20);
        expect(res).to.have.property("prev");
        expect(res).to.not.have.property("next");
    }

    @test
    replaceQueryLink(){
        const repo = this.initRepo();
        let request = this.mockRequest();
        const queryName = "page[number]";
        let res = null;
        // Test with the array parameter not added yet
        res = (repo as any).replaceQueryLink(request, queryName, '1');
        expect(res).to.equal("http://localhost/api?page[number]=1");

        // Test with existing array parameter in the url:
        request = this.mockRequest("http://localhost/api?page[number]=1");
        res = (repo as any).replaceQueryLink(request, queryName, '2');
        expect(res).to.equal("http://localhost/api?page[number]=2");

        // Test with existing string parameter in the url:
        request = this.mockRequest("http://localhost/api?a=x");
        res = (repo as any).replaceQueryLink(request, 'a', 'y');
        expect(res).to.equal("http://localhost/api?a=y");
    }

    @test
    async entityFromRequest(){
        const repo = this.initRepo();
        let request = this.mockRequest();
        // Test with empty request:
        let res = await repo.entityFromRequest(request).catch(e => e);
        // it should throw 2 errors
        expect(res).to.length(2);
        for(let err of res){
            expect(err).to.have.property('title');
            expect(err).to.have.property('status');
            expect(err).to.have.property('source');
            expect(err).to.have.property('detail');
        }

        // Test with normal post request:
        const requestData: IResourceFields = {
            id: "",
            type: "ModelA",
            attributes: {
                firstName: "john",
                lastName: "doe",
            },
        };
        request = this.mockRequest(null, requestData);
        res = await repo.entityFromRequest(request).catch(e => e);
        expect(res).to.have.property('dataValues');
        expect(res.dataValues).to.have.property('firstName');
        expect(res.dataValues).to.have.property('lastName');
        expect(res.dataValues.firstName).to.equal(requestData.attributes.firstName);
        expect(res.dataValues.lastName).to.equal(requestData.attributes.lastName);

        // test creating entity with relationships:
        let b = new ModelB();
        b.address_a = "a";
        b.address_b = "b";
        b = await b.save();
        requestData.relationships = {
            manyItems: {
                data: {
                    type: "ModelB",
                    id: b.id,
                },
            },
        };
        request = this.mockRequest(null, requestData);
        res = await repo.entityFromRequest(request).catch(e => e);
        expect(res).to.have.property('_options');
        expect(res._options).to.have.property('includeNames');
        expect(res._options.includeNames).to.length(1);
        expect(res._options.includeNames[0]).to.equal('manyItems');

        // test with existing entity & its relationship changed:
        const modelARepo = this.container.resolve(UserRepository);
        const modelAEntity = await modelARepo.findOne({include:[ModelA]}).catch(e => e);
        requestData.id = modelAEntity.id;
        request = this.mockRequest(null, requestData);
        res = await repo.entityFromRequest(request,true).catch(e => e);
        const stop = null;
    }

    @test
    async generateEntity(){
        const repo = this.initRepo();
        // Test generating new entity:
        const data = <IDeSerialized> {
            firstName: "john",
            lastName: "doe",
        };
        let res = (repo as any).generateEntity(data, null, [], null, false);
        expect(res).to.have.property('dataValues');
        expect(res.dataValues).to.have.property('firstName');
        expect(res.dataValues).to.have.property('lastName');
        expect(res.dataValues.firstName).to.equal(data.firstName);
        expect(res.dataValues.lastName).to.equal(data.lastName);

        // test generating entity with relationship:
        const model_a_repo = this.container.resolve(ModelARepository);
        const person = await model_a_repo.findOne().catch(e => e);
        let relations:Array<IAssociationInfo> = [{value: person.id, attribute: "peopleId"}];
        let options = <BuildOptions>{
            include: [ModelA]
        };
        res = (repo as any).generateEntity(data, null, relations, options, false);
        // assert relations:
        expect(res).to.have.property('_options');
        expect(res._options).to.have.property('includeNames');
        expect(res._options.includeNames).to.length(1);
        expect(res._options.includeNames[0]).to.equal('people');
        expect(res).to.have.property('dataValues');
        // assert attributes:
        expect(res.dataValues).to.have.property('firstName');
        expect(res.dataValues).to.have.property('lastName');
        expect(res.dataValues.firstName).to.equal(data.firstName);
        expect(res.dataValues.lastName).to.equal(data.lastName);

        // test overriding existing entity with new values:
        const entity = new ModelA();
        entity.firstName = "john";
        entity.lastName = "doe";
        res = (repo as any).generateEntity(data, entity, relations, options, true);
        // assert attributes:
        expect(res).to.have.property('dataValues');
        expect(res.dataValues).to.have.property('firstName');
        expect(res.dataValues).to.have.property('lastName');
        expect(res.dataValues.firstName).to.equal(data.firstName);
        expect(res.dataValues.lastName).to.equal(data.lastName);
    }
}