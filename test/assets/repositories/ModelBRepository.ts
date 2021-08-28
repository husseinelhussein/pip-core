import { BaseRepository } from '../../../src/repositories/BaseRepository';
import ModelB from '../models/ModelB';
import { injectable } from 'inversify';

@injectable()
export class ModelBRepository extends BaseRepository<ModelB>{}