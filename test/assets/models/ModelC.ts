import { BaseModel } from '../../../src/models/BaseModel';
import { Column, DataType } from 'sequelize-typescript';
import { IsString, Required } from '../../../src/validation';
import { Table } from '../../../src/models/Table';
import { TableOptions } from '../../../src/models/interfaces/TableOptions';
import { DefaultRepository } from '../../../src/repositories/DefaultRepository';

const options: TableOptions = {
  tableName: "model_c",
  modelName:"ModelC",
  timestamps: true,
  paranoid: true,
  underscored: true,
  repository: DefaultRepository,
};
@Table(options)
export default class ModelC extends BaseModel<ModelC>{
  @Required()
  @IsString()
  @Column(DataType.STRING)
  firstName: string;

  @Required()
  @IsString()
  @Column(DataType.STRING)
  lastName: string;
}