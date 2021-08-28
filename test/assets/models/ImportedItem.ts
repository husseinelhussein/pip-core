import { Table, Column, DataType, TableOptions, IsNumeric } from 'sequelize-typescript';
import { BaseModel } from '../../../src/models/BaseModel';
import { Required } from '../../../src/validation';

const options: TableOptions = {
    tableName: "imported_items",
    modelName:"ImportedItem",
    timestamps: false,
    underscored: true,
};
@Table(options)
export default class ImportedItem extends BaseModel<ImportedItem>{

    @Column(DataType.UUID)
    itemId: string;

    @IsNumeric
    @Column(DataType.STRING)
    public uniqueId: string;

    @Required()
    @Column(DataType.STRING)
    public tableName: string;
}
