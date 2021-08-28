import { Kernel } from '../../kernel/kernel';
import { BaseSeeder } from './BaseSeeder';
import * as _ from 'lodash';
import { QueryInterface } from 'sequelize';
import { Manager } from '../../container/Manager';
import { Container } from 'inversify';
import { singular } from "pluralize";
declare let kernel: Kernel;
export class SeedManager extends Manager{
  protected static getPath():string{
    return kernel.getConfig().seeders_path;
  }
  public static async register(container: Container, registerName?: boolean, collectOnly?: boolean, singleton?: boolean){
    return await super.register(container, registerName, collectOnly, singleton);
  }
  public static async getSeeders<T extends BaseSeeder<any>>(queryInterface: QueryInterface):Promise<T[]>{
    const container = kernel.getContainer();
    const tables = await queryInterface.showAllTables();
    let seeders:T[] = [];
    if (tables) {
      for (const table of tables) {
        const singularName = singular(table);
        const seederName =_.upperFirst(_.camelCase(singularName)) + "Seeder";
        let seeder:T|null = null;
        try {
          seeder = container.get(seederName);
        }
        catch (e) {
          // 
        }
        if (seeder) {
          seeders.push(seeder);
        }
      }
    }
    seeders = seeders.sort((a,b) => {
      return a.getOrder() - b.getOrder();
    });
    return seeders;
  }

}