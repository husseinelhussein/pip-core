import {Promise} from 'sequelize';
import { BaseRepository } from './BaseRepository';
import { injectable } from 'inversify';
import User from '../models/User';

@injectable()
export class UserRepository extends BaseRepository<User>{

    findByEmail(email: string): Promise<User|null>{
        return this.model.findOne({
           where:{email}
        });
    }
}