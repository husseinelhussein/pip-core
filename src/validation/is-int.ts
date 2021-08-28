import { addAttributeOptions } from 'sequelize-typescript';
import { errorMessages } from './error-messages';

export function IsInt(msg?: string){
    return (target: any, propertyName: string) => {
        addAttributeOptions(target,propertyName, {
            validate: {
                isInt: {msg: msg?msg: errorMessages['isInt']}
            },
        })
    }
}