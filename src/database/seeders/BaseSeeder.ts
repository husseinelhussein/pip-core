import { QueryInterface } from 'sequelize';
import { BaseModel } from '../../models/BaseModel';
import {StaticModel} from "../../@types/model.t";
export abstract class BaseSeeder <T extends BaseModel>{

  /**
   * Gets the order of the run, low to high.
   */
  public abstract getOrder(): number;

  public abstract getModel(): StaticModel<T>;

  /**
   * Sets the interface.
   */
  public abstract setQueryInterface(queryInterface: QueryInterface): void;

  /**
   * Seeds a certain model table with records.
   */
  public abstract async up():Promise<T[]>;

  /**
   * Removes records for a certain model.
   */
  public abstract async down():Promise<any>;
}