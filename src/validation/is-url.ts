import { addAttributeOptions } from 'sequelize-typescript';
import { errorMessages } from './error-messages';

export function IsUrl(msg?: string){
    return (target: any, propertyName: string) => {
        addAttributeOptions(target,propertyName, {
            validate: {
                isUrl: {msg: msg?msg: errorMessages['isUrl']}
            },
        })
    }
}