import { BaseResource } from './BaseResource';
import { injectable } from 'inversify';

@injectable()
export class DefaultResourceHandler extends BaseResource<any>{}