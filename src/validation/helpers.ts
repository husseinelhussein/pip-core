import { errorMessages } from './error-messages';
import { StaticModel } from '../@types/model.t';
function normalizeField(field: string): string{
    // make first letter capital:
    const upper:any = field&&field[0].toUpperCase()+field.slice(1);

    // add space between uppercase letters:
    const arr = upper.split(/(?=[A-Z])/);
    let text = "";
    if (arr.length > 1) {
        for(const item of arr){
            text+= ' ' +item
        }
    }
    else {
        text = arr[0];
    }
    return text;
}
export function getMessage(field: string, validator: string, message?: string): string{
    let msg = message;
    if(!msg){
        msg = normalizeField(field) + " " + errorMessages[validator];
    }
    return msg;
}

export function isNullable(attr:string, target: StaticModel<any>): boolean|undefined{
    return target.rawAttributes[attr].allowNull;

}