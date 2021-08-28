import { addAttributeOptions } from 'sequelize-typescript';
import { errorMessages } from './error-messages';

export function IsDate(msg?: string){
    return (target: any, propertyName: string) => {
        addAttributeOptions(target,propertyName, {
            validate: {
                isDate: {msg: msg?msg: errorMessages['isDate'], args:true}
            },
        })
    }
}