import { InitOptions as BaseInitOptions } from 'sequelize';
import { RepositoryConstructor } from './TableOptions';
import { BaseRepository } from '../../repositories/BaseRepository';

export interface InitOptions extends BaseInitOptions{
  repository?: typeof BaseRepository;
}