import { QueryInterface } from 'sequelize';
import {DataType} from 'sequelize-typescript';

export const order = 1;
export async function up(query: QueryInterface) {
  await query.createTable('model_a', {
    id: {
      type: DataType.UUID,
      primaryKey: true,
      allowNull: false,
    },
    first_name: {
      type: DataType.STRING
    },
    last_name: {
      type: DataType.STRING
    },
    model_b_id: {
      type: DataType.UUID,
      references: {
        model: 'model_b',
        key: 'id',
      },
      onDelete: "SET NULL",
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
  await query.dropTable('model_a');
}