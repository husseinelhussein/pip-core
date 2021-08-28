import {AssociationActionOptions as baseOptions} from "sequelize-typescript";

export interface AssociationActionOptions  extends baseOptions{
  save?:boolean;
}