import { BaseRepository } from '../../../src/repositories/BaseRepository';
import ModelA from '../models/ModelA';
import { injectable } from 'inversify';

@injectable()
export class ModelARepository extends BaseRepository<ModelA>{}