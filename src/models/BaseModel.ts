import {
    Column,
    DataType,
    Model,
    PrimaryKey,
    BeforeCreate,
    BeforeBulkCreate,
} from 'sequelize-typescript';
import * as uuid from "uuid/v4"
import { InitOptions } from './interfaces/InitOptions';
import { Promise as DBPromise, SaveOptions } from 'sequelize';
import { AssociationActionOptions } from './interfaces/AssociationActionOptions';
import { UUID } from '../model/column/UUID';
import { Kernel } from '../kernel/kernel';
import { RepositoryManager } from '../repositories/RepositoryManager';
declare let kernel: Kernel;
export abstract class BaseModel<T = any, T2 = any> extends Model<T,T2>{
    @PrimaryKey
    @Column(DataType.UUID)
    id: string;

    public static options: InitOptions;
    public allowedAttributes: Array<string> = ["*all*"];
    public allowUnknownAttributes = false;
    public hiddenAttributes:Array<string> = ['deletedAt'];
    public visibleAttributes: Array<string> = [];

    $set<R extends Model<R>>(propertyKey: keyof this, instances: R | R[] | string[] | string | number[] | number, options?: AssociationActionOptions): DBPromise<unknown>{
        let _options:AssociationActionOptions = {save: false};
        if(options){
            _options = options;
            if(!_options.hasOwnProperty('save')){
                _options.save = false;
            }
        }
        return super.$set(propertyKey,instances, _options);
    }

    public getVisibleAttributes():Array<string>{
        const $this: any = this;
        const attributes:Array<string> = Object.keys($this.rawAttributes);
        let visible: Array<string> = [];
        let hidden:Array<string> = [];
        if(this.hiddenAttributes.length){
            if(this.hiddenAttributes.includes("*all*")){
                hidden = attributes;
            }else{
                for(const hiddenAttr of this.hiddenAttributes){
                    if(attributes.includes(hiddenAttr)){
                        hidden.push(hiddenAttr);
                    }
                }
            }
        }
        if(this.visibleAttributes.length){
            if(this.visibleAttributes.includes("*all*")){
                visible = attributes;
            }else{
                for(const visibleAttr of this.visibleAttributes){
                    if(attributes.includes(visibleAttr)){
                        visible.push(visibleAttr);
                    }
                }
            }
        }else{
            visible = attributes;
        }
        let primaryKey = "id";
        // search for primary key:
        for(const attr of attributes){
            const attrVal = $this.rawAttributes[attr];
            if(attrVal.primaryKey && attrVal.autoIncrement){
                primaryKey = attrVal.field;
            }
        }
        // remove id from hidden attributes:
        hidden = hidden.filter(item => {
            return item !== primaryKey;
        });
        // include only visible attributes:
        visible = visible.filter(item => {
           return !hidden.includes(item);
        });
        return visible;
    }

    /**
     * Sets a default UUID value for fields of type UUID.
     * @param instance
     */
    @BeforeCreate
    static async generateUUID(instance: BaseModel<any>) {
        const attributes = (instance as any).rawAttributes;
        for(const attr of Object.keys(attributes)){
            const t = attributes[attr].type.constructor.name;
            const primary = attributes[attr].primaryKey;
            if(t === 'UUID' && primary){
                //const repo = RepositoryManager.findRepository(this.name);
                //let val = null;
                // let err = null;
                // let found = true;
                // while(found){
                //     val = uuid();
                //     found = await repo.findById(val).catch(e => err = e);
                // }
                (instance as any).set(attr, uuid());
            }
        }
    }

    @BeforeBulkCreate
    static async bulkGenerateUUID(instances: BaseModel<any>[]){
        for(const instance of instances){
            await this.generateUUID(instance);
        }
    }
}