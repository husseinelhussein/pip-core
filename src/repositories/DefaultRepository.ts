import { BaseRepository } from './BaseRepository';
import { injectable } from 'inversify';

@injectable()
export class DefaultRepository extends BaseRepository<any>{}