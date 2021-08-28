import { injectable } from 'inversify';
import { BaseRepository } from '../../../src/repositories/BaseRepository';
import ImportedItem from '../models/ImportedItem';

@injectable()
export class ImportedItemRepository extends BaseRepository<ImportedItem>{}