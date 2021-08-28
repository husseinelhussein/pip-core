import { BaseModel, BaseModel as OriginalModel } from '../models/BaseModel';
import { BuildOptions, FindOptions, Op, SaveOptions } from 'sequelize';
import { Request } from 'express';
import { RepositoryManager } from './RepositoryManager';
import { IFieldError, IAssociationInfo } from './interfaces/IEntityValError';
import { IEntityValResult } from './interfaces/IEntityValResult';
import { IFCResult } from './interfaces/IFCResult';
import { ILinks, IMeta, IPaginationInfo } from './interfaces/IPagination';
import { IPagOptions, IRelationOption } from './interfaces/IPagOptions';
import {
    IDeSerialized,
    IRelationIdB,
    IRelationships,
    IRelationshipsData,
} from '../serializer/interfaces/IDeSerialized';
import { IRelationInfo } from './interfaces/IRelationInfo';
import { Repository } from './Repository';
import * as _ from "lodash";
import { IResourceOptions } from './interfaces/IResourceOptions';

export abstract class BaseRepository<T extends OriginalModel> extends Repository<T>{
    private unsyncedRelations: IRelationInfo[];
    private changedRelations: IRelationInfo[];
    async paginate(request: Request, options?: IPagOptions): Promise<IPaginationInfo<T>>{
        let page = 0;
        let size = 10;
        let filter:any = null;
        const relations: any = [];
        const attributes: Array<string> = this.getAttributes();
        if(options){
            page = options.page;
            size = options.size;
            if(options.filter){
                filter = {};
                for(const col of Object.keys(options.filter)){
                    if(col === "query"){
                        filter["name"] = {
                            [Op.iLike]: "%" + options.filter[col] + "%",
                        };
                    }
                }
            }
            if(options.relations){
                for(const relation of options.relations){
                    relations.push(relation);
                }
            }
        }
        const findOptions = <FindOptions>{
            offset: page > 0? (page -1) * size: 0,
            limit: size,
            order: [
                ['id', 'DESC'],
            ],
            where: filter
        };
        if(relations && relations.length){
            findOptions.include = relations;
        }
        if(filter){
            findOptions.where = filter;
        }
        if(attributes && attributes.length){
            findOptions.attributes = attributes;
        }
        let errors = null;
        const result = await this.findAndCountAll(findOptions).catch(e => errors = e);
        if(errors){
            return <IPaginationInfo<T>>{
                error: this.errorHandler.generateErrorResource(errors),
            };
        }
        return this.buildResource(request, result, page, size);
    }
    private buildResource(request: Request, result: IFCResult<T>, page: number, size: number):IPaginationInfo<T>{
        const meta = this.buildMeta(result.count, page, size);
        const links = this.buildLinks(request, page, size, result.count);
        const pagination:IPaginationInfo<T> = {
            rows: result.rows,
            links: links,
            meta: meta,
        };
        return pagination;
    }
    private buildMeta(count: number, page: number, size: number): IMeta{
        const res = {
            current: page > 0? page: 1,
            pages: Math.ceil(count / size),
            total: count,
        };
        return res;
    }
    private buildLinks(request: Request, page:number, size: number, count: number): ILinks{
        // if current page is 0, make it 1..:
        const prev = (page  > 1? page -1: 1);
        const last = Math.ceil(count / size);
        const next = (page  > 1? page +1: 2);
        const links:ILinks = {
            first: this.replaceQueryLink(request,'page[number]','1'),
            last: this.replaceQueryLink(request,'page[number]', last),
        };

        if (prev > 0 && page > 1) {
            links.prev = this.replaceQueryLink(request,'page[number]', prev);
        }

        if(next <= last){
            links.next = this.replaceQueryLink(request,'page[number]', next);
        }
        return links;
    }

    /**
     * Replaces a query parameter with a new value.
     *
     * @param request
     * @param queryName
     * @param newValue
     *
     * @returns string: the original url with the query edited.
     */
    private replaceQueryLink(request: Request,queryName: string, newValue: any): string{
        let link = request.originalUrl;
        link = decodeURIComponent(link);
        let newQName = queryName.replace("[","\\[");
        newQName = newQName.replace("]","\\]");
        const fMatch = `(${newQName}=)(\\w|\\d){1,6}`;
        const fMatchR = new RegExp(fMatch,'g');
        const res = fMatchR.exec(link);
        if(!res){
            // add default value:
            const prefix = link.includes("?")? "&": "?";
            link += prefix + queryName + "=" + newValue;
            return link;
        }
        const replace = queryName + "=" + newValue;
        return link.replace(fMatchR, replace);
    }

    /**
     * Creates entity without saving it, from request.
     *
     * @param request
     * @param edit
     *
     * @returns Promise: the created entity.
     */
    entityFromRequest(request: Request, edit = false): Promise<T>{
        return new Promise<T>(async (resolve, reject) => {
            let errors:Array<any> = [];
            const validRelations:Array<IRelationInfo> = [];
            const requestData = <IDeSerialized> this.serializer.deSerialize(request.body);
            let entity:any = null;
            const relations = this.findRelations(requestData.relationships, edit);
            const skip:Array<string> = [];
            // if we are editing, find the existing entity:
            if(edit){
                const entityRes = await this.findAndValidateEntity(requestData.id,'id', this, true);
                if(entityRes.valid){
                    entity = entityRes.value;
                }else{
                    reject(entityRes.errors);
                }
            }
            // Validate relationships:
            if(relations && relations.length){
                for(const relation of relations){
                    let idName = _.camelCase(relation.as + "Id");
                    if (idName === "assigneeId") idName = "assignedTo";
                    if (idName === "officeId") idName = "officeCodeId";
                    skip.push(idName);
                    if(relation.ids && relation.ids.length){
                        for(const relId of relation.ids){
                            const valResult = await this.validateRelation(relId, relation)
                                .catch(e => {
                                    errors = errors.concat(e);
                                });
                            if (valResult) {
                                if (relation.values && relation.values.length) {
                                    relation.values.push(valResult.value);
                                }
                                else {
                                    relation.values = [valResult.value];
                                }
                                validRelations.push(relation);
                            }
                        }
                    }
                }
                if(errors.length){
                    reject(errors);
                    return;
                }
            }
            // Include the relationships:
            let options:BuildOptions = {};
            if(validRelations && validRelations.length){
                // include the relations models in the options:
                options = this.includeRelations(relations, entity);
                if(entity){
                    this.unsyncedRelations = relations;
                }
            }
            const primaryKey = this.model.primaryKeyAttribute;
            const res = this.generateEntity(requestData, entity, validRelations, options, [primaryKey], edit);
            await this.validate(res, requestData,{skip}).catch(e => {
                errors = errors.concat(e);
            });
            if(errors && errors.length){
                reject(errors);
            }else{
                resolve(res);
            }
        });
    }

    /**
     * Generates a new entity from de-serialized data.
     *
     * @param data: the data for the entity
     * @param entity: if we are updating the entity
     * @param relations: the entity relations.
     * @param options: entity options when generating new entity
     * @param skip: list of attributes to skip when updating the entity attributes
     * @param edit: if we are editing or generating new entity
     */
    private generateEntity(data:IDeSerialized,
                           entity: any,
                           relations?: Array<IRelationInfo>|null,
                           options?: any,
                           skip?:Array<string>|null,
                           edit?: boolean|null): T{
        const values = _.clone(data);
        if(values.relationships){
            delete values.relationships;
        }
        // include relations:
        if(relations){
            for(const relation of relations) {
                if (relation.foreignKeyAttr && relation.ids) {
                    values[relation.foreignKeyAttr] = relation.ids.pop();
                }
                else {
                    values[relation.as] = relation.values;
                }
            }
        }
        if (edit && entity && entity instanceof OriginalModel) {
            // populate updated properties:
            for(const property of Object.keys(values)){
                if(!skip || (skip && !skip.includes(property))){
                    const prop: any = property;
                    entity.set(prop, values[property])
                }
            }
            // todo: add relations to existing entity above..
        }
        else {
            // data is just an object
            entity = new this.model(values, options);
        }
        return entity;
    }

    /**
     * gets a model defined relationships.
     *
     * @param repository
     * @param edit
     */
    protected getModelRelations(repository: BaseRepository<any>, edit?:boolean|null):Array<IRelationInfo>{
        const relations = <IRelationInfo[]> [];
        for(const relation of Object.keys(repository.model.associations)){
            const relationObj:any = repository.model.associations[relation];
            if(relationObj.options && relationObj.options.foreignKey) {
                const allowNull = relationObj.options.foreignKey.allowNull;
                const rel:IRelationInfo = {
                    associationType: relationObj.associationType,
                    singular: relationObj.target.options.name.singular,
                    plural: relationObj.target.options.name.plural,
                    receivedAs: "",
                    as: relationObj.as,
                    model: relationObj.target,
                    required: false,
                    allowNull: typeof allowNull === 'boolean'? allowNull: true,
                };
                if(relationObj.foreignKeyAttribute){
                    rel.foreignKeyAttr = relationObj.foreignKeyAttribute.name;
                }
                rel.required = !rel.allowNull;
                if(edit){
                    rel.required = false;
                }
                relations.push(rel);
            }
        }
        return relations;
    }

    /**
     * Finds the defined relationships
     * @param relationships
     * @param edit
     */
    private findRelations(relationships?: IRelationships, edit = false): Array<IRelationInfo>{
        const result:IRelationInfo[] = [];
        const relations = this.getModelRelations(this, edit);
        const relationsData:IRelationIdB[] = [];
        // finds a relation ids and returns them:
        if (relationships) {
            for (const relName of Object.keys(relationships)) {
                const relData:IRelationshipsData = relationships[relName];
                if (Array.isArray(relData.data)) {
                    for(const relItem of relData.data){
                        relationsData.push(relItem);
                    }
                }
                else if(relData.data){
                    relationsData.push(relData.data);
                }
            }
        }
        for (const relation of relations) {
            // gather the relation ids:
            let ids:string[] = [];
            if (relation.ids && relation.ids.length) {
                ids = relation.ids;
            }
            for (const aRelation of relationsData) {
                if( _.camelCase(aRelation.name) === _.camelCase(relation.as)) {
                    ids.push(aRelation.id.toString());
                }
            }

            if (ids.length) {
                relation.ids = ids;
                result.push(relation);
            }
            else if (relation.required) {
                result.push(relation);
            }
        }
        // include receivedAs field:
        for (const relation of result) {
            for (const aRelation of relationsData) {
                if (_.camelCase(aRelation.name) === _.camelCase(relation.as)) {
                    relation.receivedAs = aRelation.name;
                }
            }
        }
        return result;
    }

    /**
     * Updates the entity attached relations
     *
     * @param entity
     * @param relations
     */
    private async syncRelations(entity: T, relations: Array<IRelationInfo>){
        for(const relation of relations){
            if(relation.values && relation.values.length){
                switch (relation.associationType) {
                    case "HasMany":
                    case "BelongsToMany":
                        await this.syncMany(entity, relation, relation.values);
                        break;
                    case "BelongsTo":
                        await this.syncSingle(entity, relation, relation.values);
                        break;
                }
            }
        }
    }

    /**
     * Syncs to-one relation type on the entity.
     *
     * @param entity
     * @param relation
     * @param values
     */
    private async syncSingle(entity: T, relation: IRelationInfo, values:BaseModel<any>[]):Promise<any>{
        const _entity:any = entity;
        // attach the new relationships:
        const newRelations:BaseModel<any>[] = [];
        for(const relatedEntity of values){
            newRelations.push(relatedEntity);
        }
        const previous_id = _entity.get(relation.as).id;
        const last = <BaseModel<any>> newRelations.pop();
        if(previous_id !== last.id){
            if(!this.changedRelations){
                this.changedRelations = [];
            }
            this.changedRelations.push(relation);
            await _entity.$set(relation.as, last).catch((e:any) => this.errorHandler.handle(e));
        }
    }

    /**
     * Syncs to-many relation type on the entity.
     *
     * @param entity
     * @param relation
     * @param values
     */
    private async syncMany(entity: T, relation: IRelationInfo, values:BaseModel<any>[]):Promise<any>{
        const _entity:any = entity;
        const attachedRelations = _entity.get(relation.as);
        let changed = false;

        // search for new relations:
        let newValues:BaseModel<any>[] = [];
        if (attachedRelations) {
            for (const newVal of values) {
                let found = false;
                for (const existingVal of attachedRelations) {
                    if (existingVal.id === newVal.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    newValues.push(newVal);
                }
            }
        }
        else {
            newValues = values;
        }
        if (newValues.length){
            changed = true;
        }

        if (!changed) {
            // we don't need to update if the values are not changed:
            return false;
        }

        if(!this.changedRelations){
            this.changedRelations = [];
        }
        this.changedRelations.push(relation);

        // attach the new relationships:
        await _entity.$set(relation.as, values).catch((e:any) => this.errorHandler.handle(e));
    }

    /**
     * Includes given relations in BuildOptions object.
     *
     * @param relations
     * @param entity
     */
    private includeRelations(relations: Array<IRelationInfo>, entity?: T): BuildOptions{
        const options: BuildOptions = {};
        const include = [];
        // include them:
        for(const relation of relations){
            include.push(relation.model);
        }
        options.include = include;
        return options;
    }
    validateRelation(id: string, info: IRelationInfo): Promise<IAssociationInfo>{
        return new Promise<any>(async (resolve, reject) => {
            // 1- get the repository of the relation model from container:
            const repo:any = RepositoryManager.findRepository(info.model.name);
            // 2- find and validate the entity:
            const valResult = await this.findAndValidateEntity(id, info.as, repo);
            if(valResult.valid && valResult.attribute){
                const requestEntity: IAssociationInfo = {
                    value: valResult.value,
                    attribute: valResult.attribute
                };
                resolve(requestEntity);
            }
            else {
                for (const error of valResult.errors) {
                    // fix the pointer to include the relationships path:
                    const pointer = error.source.pointer;
                    const replacement = "/relationships/" + info.receivedAs + "/data";
                    error.source.pointer = pointer.replace("/attributes", replacement);
                }
                reject(valResult.errors);
            }
        })
    }

    /**
     * Find entity by ID or validate it if we are creating new one.
     *
     * @param id
     * @param attribute
     * @param entityRepo
     * @param withRelations
     */
    protected async findAndValidateEntity(id: string,
                                        attribute: string,
                                        entityRepo: BaseRepository<any>,
                                        withRelations?: boolean|null):Promise<IEntityValResult> {
        const idAttr = attribute + "Id";
        let entity = null;
        const result: IEntityValResult = {
            valid: false,
            value: null,
            attribute: attribute,
        };
        const notFoundErr: IFieldError = {
            status: 404,
            title: "Entity not found",
            detail: "Entity not found",
            source: {
                pointer: "data/attributes/id"
            },
            meta: {
                field: attribute,
            }
        };
        // if the body contains the entity id, find it:
        const find = async (id: any) => {
            let options:IResourceOptions|null = null;
            if(withRelations){
                const relations = this.getModelRelations(entityRepo);
                const include = <IRelationOption[]>[];
                if(relations.length){
                    for(const relation of relations){
                        const relOption = <IRelationOption> { model: relation.model };
                        include.push(relOption);
                    }
                    options = { relations: include};
                }
            }
            const en = await entityRepo.findById(id, options).catch(e => {
                notFoundErr.detail = e.message;
                notFoundErr.title = e.message;
            });
            if (en) {
                result.valid = true;
            }
            return en;
        };
        // find the main entity if the id is specified:
        if(attribute === 'id'){
            notFoundErr.source.pointer = "data/id";
            entity = await find(id);
            if(entity){
                result.value = entity;
            }
        }
        // find a relation entity:
        else{
            result.attribute = idAttr;
            entity = await find(id);
        }

        if (!entity) {
            result.errors = [notFoundErr];
            return result;
        }
        result.value = entity;
        return result;
    }

    async save(model: T, options?: SaveOptions):Promise<T>{
        if(this.unsyncedRelations && this.unsyncedRelations.length){
            await this.syncRelations(model, this.unsyncedRelations);
            // reload the model if there are relationship changes:
            if(this.changedRelations && this.changedRelations.length){
                const res = await model.reload().catch(e => this.errorHandler.handle(e));
                if(res){
                    model = res;
                }
            }
        }
        return super.save(model, options);
    }

}