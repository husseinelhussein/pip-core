import { BaseModel } from '../../../src/models/BaseModel';
import { Column, DataType, Table, TableOptions } from 'sequelize-typescript';
import { IsString, Required } from '../../../src/validation';

const options: TableOptions = {
  tableName: "model_b",
  modelName:"ModelB",
  timestamps: true,
  paranoid: true,
  underscored: true,
};
@Table(options)
export default class ModelB extends BaseModel<ModelB>{
  @Required()
  @IsString()
  @Column(DataType.STRING)
  address_a: string;

  @IsString()
  @Column(DataType.STRING)
  address_b: string;

}