import { TableOptions as OriginalTableOptions} from 'sequelize-typescript';
import { BaseRepository } from '../../repositories/BaseRepository';
import { Container } from 'inversify';
import { ErrorHandlerService } from '../../services/ErrorHandlerService';
import { Serializer } from '../../serializer/Serializer';
import { DatabaseService } from '../../services/DatabaseService';
import { BaseModel } from '../BaseModel';
export interface RepositoryConstructor<T extends BaseModel>{
    new (container: Container,
         errHandler: ErrorHandlerService,
         serializer: Serializer,
         databaseService: DatabaseService, ...args: any[]): T;
}
export interface TableOptions extends OriginalTableOptions{
    repository?: typeof BaseRepository;
}