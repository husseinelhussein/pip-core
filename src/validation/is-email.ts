import { addAttributeOptions } from 'sequelize-typescript';
import { errorMessages } from './error-messages';
import { isNullable } from './helpers';

export function IsEmail(msg?: string){
    return (target: any, propertyName: string) => {
        if(!msg){
            msg = errorMessages['isEmail'];
        }
        addAttributeOptions(target,propertyName, {
            validate: {
                IsEmail(value: any){
                    const nullable = isNullable(propertyName, target);
                    const valid = /^\S+@\S+\.\S+$/
                    if(!valid.test(value) && !nullable){
                        throw new Error(msg);
                    }
                }
            }
        })
    }
}