import { QueryInterface } from 'sequelize';
import { DataType } from 'sequelize-typescript';
export async function up(query: QueryInterface, sequelize: any) {
  await query.createTable('imported_items', {
    id: {
      type: sequelize.UUID,
      allowNull: false,
      primaryKey: true
    },
    item_id: {
      type: sequelize.UUID,
      allowNull: false,
    },
    unique_id: {
      type: DataType.STRING,
      allowNull: false,
    },
    table_name: {
      type: DataType.STRING,
      allowNull: false,
    },

  });

  await query.addIndex('imported_items',['item_id'],{
    name: "item_id",
    type: "FULLTEXT",
  });

}

export async function down(query: QueryInterface) {
  await query.dropTable('imported_items');
}