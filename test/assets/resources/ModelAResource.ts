import { injectable } from 'inversify';
import ModelA from '../models/ModelA';
import { BaseResource } from '../../../src/resources/BaseResource';

@injectable()
export class ModelAResource extends BaseResource<ModelA>{}