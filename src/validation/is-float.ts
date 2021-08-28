import { addAttributeOptions } from 'sequelize-typescript';
import { errorMessages } from './error-messages';

export function IsFloat(msg?: string){
    return (target: any, propertyName: string) => {
        addAttributeOptions(target,propertyName, {
            validate: {
                isFloat: {msg: msg?msg: errorMessages['isFloat']}
            },
        })
    }
}