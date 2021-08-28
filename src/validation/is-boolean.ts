import { addAttributeOptions } from 'sequelize-typescript';
import { errorMessages } from './error-messages';
import { isNullable } from './helpers';

export function IsBoolean(msg?: string){
    return (target: any, propertyName: string) => {
        if(!msg){
            msg = errorMessages['isBoolean'];
        }
        addAttributeOptions(target,propertyName, {
            validate: {
                isBoolean(value: any){
                    const nullable = isNullable(propertyName, target);
                    if(typeof value !== 'boolean' && !nullable){
                        throw new Error(msg);
                    }
                }
            },
        })
    }
}