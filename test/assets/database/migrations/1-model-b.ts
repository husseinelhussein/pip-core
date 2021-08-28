import { QueryInterface } from 'sequelize';
import {DataType} from 'sequelize-typescript';

export const order = 1;
export async function up(query: QueryInterface) {
  await query.createTable('model_b', {
    id: {
      type: DataType.UUID,
      primaryKey: true,
      allowNull: false,
    },
    old_id: {
      type: DataType.INTEGER,
    },
    address_a:{
      type: DataType.STRING,
      allowNull: false,
    },

    address_b:{
      type: DataType.STRING,
    },
    created_at: {
      allowNull: false,
      type: DataType.DATE
    },
    updated_at: {
      allowNull: false,
      type: DataType.DATE
    },
    deleted_at: {
      allowNull: true,
      type: DataType.DATE
    },

  });

}

export async function down(query: QueryInterface) {
  await query.dropTable('model_b');
}