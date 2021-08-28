import { addAttributeOptions } from 'sequelize-typescript';
import * as uuid from "uuid/v4"
/**
 * Generates a UUID value for the specified field.
 */
export function UUID(){
  return (target: any, propertyName: string) => {
    addAttributeOptions(target,propertyName, {
      defaultValue: uuid(),
    })
  }
}
