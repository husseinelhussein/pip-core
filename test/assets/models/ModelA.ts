import { BaseModel } from '../../../src/models/BaseModel';
import { Column, DataType, Table, ForeignKey, BelongsTo, TableOptions } from 'sequelize-typescript';
import { IsString, Required } from '../../../src/validation';
import ModelB from './ModelB';

const options: TableOptions = {
  tableName: "model_a",
  modelName:"ModelA",
  timestamps: true,
  paranoid: true,
  underscored: true,
};
@Table(options)
export default class ModelA extends BaseModel<ModelA>{
  @Required()
  @IsString()
  @Column(DataType.STRING)
  firstName: string;

  @Required()
  @IsString()
  @Column(DataType.STRING)
  lastName: string;

  @ForeignKey(() => ModelB)
  @Column
  modelBId: string;

  @BelongsTo(() => ModelB,{foreignKey: {allowNull: false}})
  modelB: ModelB;
}