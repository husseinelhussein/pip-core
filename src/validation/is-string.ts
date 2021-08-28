import { addAttributeOptions } from 'sequelize-typescript';
import { errorMessages } from './error-messages';
import { isNullable } from './helpers';

export function IsString(msg?: string){
    return (target: any, propertyName: string) => {
        if(!msg){
            msg = errorMessages['isString'];
        }
        addAttributeOptions(target,propertyName, {
            validate: {
                isString(value: any){
                    const nullable = isNullable(propertyName, target);
                    if(typeof value !== 'string' && !nullable){
                        throw new Error(msg);
                    }
                }
            },
        })
    }
}