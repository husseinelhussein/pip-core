import { addAttributeOptions } from 'sequelize-typescript';
import { getMessage } from './helpers';

export function Required(msg?: string){
    return (target: any, propertyName: string) => {
        msg = getMessage(propertyName,"notEmpty", msg);
        addAttributeOptions(target,propertyName, {
            validate: {
                notEmpty: {msg: msg},
                notNull: {msg: msg},
            },
            allowNull: false,
        })
    }
}