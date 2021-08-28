import { SequelizeOptions } from 'sequelize-typescript';

export interface ISequelizeOptions extends SequelizeOptions{
  url?: string
}