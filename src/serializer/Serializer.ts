import { Container, inject, injectable } from 'inversify';
import { IDeSerialized, IRelationIdB, IRelationships, IRelationshipsData } from './interfaces/IDeSerialized';
import { ErrorHandlerService } from '../services/ErrorHandlerService';
import { IRelationId, IRelationInfo, IRelationResource, IResource, IResourceFields } from './interfaces/IResource';
import { BaseModel } from '../models/BaseModel';
import { BaseResource } from '../resources/BaseResource';
import { IPagination, IPaginationInfo } from '../repositories/interfaces/IPagination';
import * as _ from "lodash";
@injectable()
export class Serializer {
    protected pagination: IPagination<BaseModel>;
    protected resource: IResource;

    public constructor(@inject(Container) protected container: Container,
                       @inject(ErrorHandlerService) protected errorHandler: ErrorHandlerService){}

    /**
     * Deserializes data.
     *
     * @param data
     */
    public deSerialize(data:any):IDeSerialized|IDeSerialized[]{
        let deSerialized: IDeSerialized = {};
        if(!data){
            return deSerialized;
        }
        const isSingle = data.hasOwnProperty('id') && data.hasOwnProperty('type') && data.hasOwnProperty('attributes');
        if( (!isSingle && !data.hasOwnProperty("data")) || (!isSingle && typeof data.data !== 'object') ){
            return deSerialized;
        }
        const dataObj = isSingle? data: data.data;
        if(Array.isArray(dataObj)){
            const deSerializedArr:IDeSerialized[] = [];
            for(const item of dataObj){
                const i = this.deSerialize(item);
                deSerializedArr.push(i);
            }
            return deSerializedArr;
        }

        if(dataObj.hasOwnProperty('attributes') && typeof dataObj.attributes === 'object'){
            deSerialized = dataObj.attributes;
        }
        if(dataObj.hasOwnProperty('id') && typeof dataObj.id === 'string' || typeof dataObj.id === 'number'){
            deSerialized.id = dataObj.id;
        }
        if(dataObj.hasOwnProperty('relationships') && typeof dataObj.relationships === 'object'){
            const relations = Object.keys(dataObj.relationships);
            for(const name of relations){
                const dataAttr = Object.keys(dataObj.relationships[name]);
                const hasData = dataAttr
                    && Array.isArray(dataAttr)
                    && dataAttr.includes('data')
                    && typeof dataObj.relationships[name]['data'] === 'object';
                if(!hasData){
                    continue;
                }
                const relationData:IRelationshipsData = dataObj.relationships[name];
                deSerialized.relationships = this.appendRelation(name,relationData, deSerialized.relationships);

            }
        }
        return deSerialized;
    }

    /**
     * appends a relationship to the deserialized data.
     *
     * @param name
     * @param data
     * @param existingRelationships
     */
    private appendRelation(name: string, data: IRelationshipsData, existingRelationships?: IRelationships):IRelationships{
        const relation = <IRelationshipsData>{
            data: {
                name: _.camelCase(name)
            }
        };
        const verify = (relData: any):boolean => {
            // if the relation data is object:
            const required = ['id', 'type'];
            const attrs = Object.keys(relData);
            let attrEncluded = 0;
            for(const attr of attrs){
                if(required.includes(attr)){
                    attrEncluded++;
                }
            }
            return attrEncluded === required.length;
        };

        if(data.hasOwnProperty('data')){
            if(Array.isArray(data.data)){
                relation.data = [];
                for(const item of data.data){
                    const valid = verify(item);
                    if(valid){
                        relation.data.push(item);
                    }
                }
            }else{
                const valid = verify(data.data);
                if(valid){
                    relation.data = data.data;
                }
            }
            if(data.links){
                relation.links = data.links;
            }
        }
        let relationships:IRelationships = {};
        if(existingRelationships){
            relationships = _.cloneDeep(existingRelationships);
        }
        let found = false;
        for(const relName of Object.keys(relationships)){
          if(relName !== name){
            continue;
          }
          found = true;
          const exRelationData:IRelationshipsData = relationships[relName];
          // if the relationship data is array, append the new data
          if (Array.isArray(exRelationData.data)) {
            if (Array.isArray(relation.data)) {
              exRelationData.data = exRelationData.data.concat(relation.data);
            }
            else {
              const oldData:Array<IRelationIdB> = [];
              oldData.push(relation.data);
              exRelationData.data = exRelationData.data.concat(oldData);
            }
          }
          else {
            // convert the existing data to array and append the new data:
            let newRelData:IRelationIdB[] = [exRelationData.data];
            if (Array.isArray(relation.data)) {
              newRelData = newRelData.concat(relation.data);
            }
            else {
              newRelData.push(relation.data);
            }
            exRelationData.data = newRelData;
          }
          relationships[relName] = exRelationData;
        }
        if (!found || !Object.keys(relationships).length) {
            relationships[name] = relation;
        }
        return relationships;
    }

    public serialize(model: BaseModel<any>):IResourceFields {
        const modelAny: any = model;
        const handler = this.getHandler(model);
        let resource = <IResourceFields>{
            type: modelAny._modelOptions.name.singular,
            id: model.id.toString(),
            attributes: handler.getValues(model),
        };
        const relations = this.getRelations(model);
        if(relations.length){
            for(const relation of relations){
                if (relation.values) {
                    resource = this.addRelation(resource,relation);
                    this.includeRelation(relation); 
                }
            }
        }
        return resource;
    }

    public createMany(models: Array<BaseModel<any>>):Array<IResourceFields>{
        const resources = <Array<IResourceFields>> [];
        if(!models){
            return resources;
        }
        for(const model of models){
            const resource = this.serialize(model);
            resources.push(resource);
        }
        return resources;
    }

    public serializeModel(model: BaseModel<any>):IResource{
        const resource: IResource = {
            data: null,
        };
        this.resource = resource;
        this.resource.data = this.serialize(model);
        return this.resource;
    }

    public paginate(data: IPaginationInfo<BaseModel<any>>):IPagination<BaseModel<any>>|null{
        if(data.rows){
            this.pagination = {
                data: [],
            };
            this.pagination.data = this.createMany(data.rows);
            if(data.links){
                this.pagination.links = data.links;
            }
            if(data.meta){
                this.pagination.meta = data.meta;
            }
            if(data.error){
                this.pagination.errors = data.error
            }
            return this.pagination;
        }
        return null;
    }

    public getValues(model: BaseModel<any>): any{
        const hidden:Array<string> = ['id'];
        const attributes:Array<string> = model.getVisibleAttributes();
        const values:any = {};
        for(const attr of attributes){
            if(!hidden.includes(attr)){
                const anAttr:any = attr;
                values[attr] = model.getDataValue(anAttr);
            }
        }
        return values;
    }

    protected getRelations(model: BaseModel<any>):IRelationInfo[]{
        const aModel: any = model;
        const includeMap = aModel._options.includeMap;
        const included:Array<string> = aModel._options.includeNames;
        const relations: IRelationInfo[] = [];
        if(included){
            for(const inc of included){
                // if the model doesn't have the relation value skip:
                if(!aModel.hasOwnProperty(inc)){
                    continue;
                }
                // include the relation:
                const relation = includeMap[inc];
                const relKey:IRelationInfo = {
                    key: inc,
                    relationType: relation.association.associationType,
                    model: relation.model,
                    values: aModel[inc],
                };
                relations.push(relKey);
            }
        }
        return relations;
    }

    protected includeRelation(relationInfo: IRelationInfo){
        let resource:IResourceFields|IResourceFields[];
        if (Array.isArray(relationInfo.values)) {
            resource = [];
            for(const val of relationInfo.values){
                const rs = this.serialize(val);
                resource.push(rs);
            }
        }
        else {
            resource = this.serialize(relationInfo.values);
        }
        let included: Array<IResourceFields> = [];
        if (this.pagination && this.pagination.included) {
            included = <IResourceFields[]>this.pagination.included;
        }
        if (Array.isArray(resource)) {
            for(const item of resource){
                included.unshift(item);
            }
        }
        else {
            included.unshift(resource);
        }
        if (this.pagination){
            this.pagination.included = included;
        }
        else {
            this.resource.included = included;
        }
    }

    protected addRelation(resource:IResourceFields, relationInfo: IRelationInfo):IResourceFields{
        let newData:IRelationId|IRelationId[];
        if(Array.isArray(relationInfo.values)){
            newData = [];
            for(const val of relationInfo.values){
                const item:IRelationId = {
                    id: val.id.toString(),
                    type: relationInfo.model.name,
                };
                newData.push(item);
            }
        }else{
            const stop = null;
            newData = {
                id: relationInfo.values.id.toString(),
                type: relationInfo.model.name,
            }
        }
        let data: IRelationId|IRelationId[];
        let relations: IRelationResource = {};
        if(resource.relationships && Object.keys(resource.relationships)){
            relations = resource.relationships;
        }
        if (relations.hasOwnProperty(relationInfo.key)) {
            if(Array.isArray(relations[relationInfo.key].data)){
                // we are dealing with M:N / M:1 relations..
                const oldData = <IRelationId[]>relations[relationInfo.key].data;
                if(Array.isArray(newData)){
                    for(const item of newData){
                        oldData.push(item);
                    }
                }else{
                    oldData.push(newData);
                }
                data = oldData;
            }
            else {
                // todo: check why this relationship key exists
                data = newData;
            }
        }
        else{
            data = newData;
        }
        relations[relationInfo.key] = {
            data: data,
        };
        resource.relationships = relations;
        return resource;
    }

    protected getHandler(model: BaseModel<any>):BaseResource<any>|Serializer{
        const aModel:any = model;
        const name = aModel._modelOptions.name.singular;
        let handler: BaseResource<any>|Serializer|null = null;
        // get the resource handler:
        try {
            handler = this.container.get(name + 'Resource');
        } catch (e) {
            // 
        }
        // or get the default resource handler
        if(!handler){
            handler = this;
        }
        return handler;
    }
}
