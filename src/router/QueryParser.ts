import { injectable } from 'inversify';
import { BaseRepository } from '../repositories/BaseRepository';
import { IRelationOption } from '../repositories/interfaces/IPagOptions';
import { IFieldError } from '../repositories/interfaces/IEntityValError';
import {  Request } from 'express';
import { IQueryRelation } from './interfaces/IQueryRelation';
import { ModelCtor } from 'sequelize';

@injectable()
export class QueryParser {
    protected request: Request;
    protected allowedRelations: string[];
    public setRequest(request: Request){
        this.request = request;
    }
    public setAllowedRelations(allowed: string[]){
        this.allowedRelations = allowed;
    }

    /**
     *
     * @param repository
     */
    public getRelations(repository: BaseRepository<any>): Array<IRelationOption>{
        const relations:Array<IRelationOption> = [];
        if(!this.request.query.include){
            return relations;
        }

        let parsed:IQueryRelation[] = [];
        const queryRelations:Array<string> = (this.request.query.include as any).split(',');
        for(const rel of queryRelations){
            parsed = this.queryRelations(rel,parsed);
        }
        let nonExistingRelations:IQueryRelation[] = [];
        const errors:IFieldError[] = [];
        for(const rel of parsed){
            this.checkRelationExists(repository.model,rel);
            const nonExisting = this.getNonExistingRelations(repository.model,rel);
            nonExistingRelations = nonExistingRelations.concat(nonExisting);
        }
        if(nonExistingRelations.length){
            for(const relation of nonExistingRelations){
                const err = this.addNotAllowedErr(relation);
                errors.push(err);
            }
        }
        if(errors.length){
            throw errors;
        }

        for(const rel of parsed){
            try {
                const item = this.includeRelation(repository.model, rel);
                relations.push(item);
            } catch (e) {
                errors.push(e);
            }
        }
        if(errors.length){
            throw errors;
        }
        return relations;
    }
    private includeRelation(model: ModelCtor<any>, relation: IQueryRelation, parent?:IRelationOption):IRelationOption{
        const modelRelations = Object.keys(model.associations);
        let item: IRelationOption|null = null;
        for (const modelRelation of modelRelations) {
            if (modelRelation === relation.name) {
                item = {
                    model: model.associations[modelRelation].target,
                };
                if (parent) {
                    if (parent.include) {
                        parent.include.push(item);
                    }
                    else {
                        parent.include = [item];
                    }
                }
                if (relation.children && relation.children.length) {
                    // validate children relations as well:
                    for (const child of relation.children) {
                        const assoc = model.associations[modelRelation].target;
                        this.includeRelation(assoc, child, item);
                    }
                }
            }
        }
        if (item) {
            return item;
        }
        throw this.addNotAllowedErr(relation);
    }
    private queryRelations(relation:string, relations?: IQueryRelation[]):IQueryRelation[]{
        const reqRelations:string[] = relation.split('.');
        if (reqRelations.length <= 1) {
            const item:IQueryRelation = {
                name: reqRelations[0],
                exists: false,
                allowed: false,
            };
            if (reqRelations.length) {
                return [item];
            }
            else{
                return [];
            }
        }
        if (!relations) {
            relations = [];
        }
        for (let i = 0; i < reqRelations.length; i++) {
            if (i === 0) {
                continue;
            }
            if (relations.length) {
                this.appendToChildren(reqRelations[i], reqRelations[i-1], relations);
            }
            else {
                relations = [];
                const parent:string = reqRelations[i-1];
                const item: IQueryRelation = {
                    name: parent,
                    children: [{
                        name: reqRelations[i],
                        parent: parent,
                        children: [],
                        exists: false,
                        allowed: false,
                    }],
                    exists: false,
                    allowed: false,
                };
                relations.push(item);

            }
        }
        return relations;
    }
    private addNotAllowedErr(relation: IQueryRelation):IFieldError{
        let detail = `The resource does not have a '${relation.name}' relationship path.`;
        if(relation.parent){
            detail = `The relationship '${relation.parent}' does not have the association '${relation.name}'`;

        }
        const err:IFieldError = {
            status: 400,
            title: "Invalid Query Parameter",
            detail: detail,
            source: {
                pointer: "include"
            }
        };
        return err;
    }
    private appendToChildren(relation:string, parent?: string|null, relations?: IQueryRelation[]){
        if (relations && relations.length) {
            let found = false;
            for(const aRelation of relations){
                if (aRelation.name === parent) {
                    found = true;
                    const item = {
                        name: relation,
                        parent: parent,
                        children: [],
                        exists: false,
                        allowed: false,
                    };
                    if(aRelation.children){
                        // do not append if the child already exists:
                        let childFound = false;
                        for(const child of aRelation.children){
                            if(child.name === relation){
                                childFound = true;
                            }
                        }
                        if(!childFound){
                            aRelation.children.push(item);
                        }
                    }else{
                        aRelation.children = [item];
                    }
                }
            }
            if (!found) {
                for (const aRelation of relations) {
                    if (aRelation.children) {
                        this.appendToChildren(relation, parent, aRelation.children);
                    }
                }
            }
        }
        return relations;
    }
    private checkRelationExists(model: ModelCtor<any>, relation: IQueryRelation):IQueryRelation{
        // the model has this relation.
        const modelRelations = Object.keys(model.associations);
        for(const modelRelation of modelRelations){
            if(modelRelation === relation.name){
                relation.exists = true;
                if(this.isAllowed(relation)){
                    relation.allowed = true;
                }
                if(relation.children && relation.children.length){
                    // validate children relations as well:
                    for(const child of relation.children){
                        const assoc = model.associations[modelRelation].target;
                        this.checkRelationExists(assoc, child);
                    }
                }
            }
        }
        return relation;
    }
    private getNonExistingRelations(model: ModelCtor<any>, relation: IQueryRelation, result?: IQueryRelation[]):IQueryRelation[]{
        if(!result){
            result = [];
        }
        const modelRelations = Object.keys(model.associations);
        let found = false;
        for(const modelRelation of modelRelations){
            if(modelRelation === relation.name){
                found = relation.allowed;
                if(relation.children && relation.children.length){
                    // validate children relations as well:
                    for(const child of relation.children){
                        const assoc = model.associations[modelRelation].target;
                        this.getNonExistingRelations(assoc, child, result);
                    }
                }
            }
        }
        if(!found){
            result.push(relation);
        }
        return result;
    }

    /**
     * Checks whether a relation is allowed
     *
     * @param relation: the queried relation
     * @return boolean
     */
    private isAllowed(relation: IQueryRelation):boolean{
        if(this.allowedRelations.includes(relation.name)){
            return relation.exists;
        }
        for(const allowedRelation of this.allowedRelations){
            const children = allowedRelation.split('.');
            if(children.length > 1){
                if(children.includes(relation.name)){
                    return relation.exists;
                }
            }
            if(relation.name === allowedRelation){
                return relation.exists;
            }
            if(allowedRelation.includes("*all*")){
                return relation.exists;
            }
        }
        return false;
    }
}