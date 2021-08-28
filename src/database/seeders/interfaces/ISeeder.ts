import { QueryInterface } from 'sequelize';
export interface ISeedListener {
     up(queryInterface: QueryInterface): Promise<any>;
     down(queryInterface: QueryInterface): Promise<any>;
}
export interface ISeeder {
     up(queryInterface: QueryInterface): Promise<any>;
     down(queryInterface: QueryInterface): Promise<any>;
     name: string;
}
export interface ISeederArray {
     [key: string]: ISeeder;
}