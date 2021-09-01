import { sign } from 'jsonwebtoken';
import { IToken } from '../interfaces/IToken';
import { config } from 'dotenv';
import { resolve } from "path";
import { compare,hash } from 'bcrypt';
import {ErrorHandlerService} from './ErrorHandlerService';
import User from '../models/User';
import { inject, injectable } from 'inversify';
import { BaseService } from './BaseService';
import {ModelManager} from "../models/ModelManager";
config({ path: resolve(__dirname, "../.env") });

@injectable()
export class AuthService extends BaseService{
    errHandler: ErrorHandlerService;
    constructor(@inject(ErrorHandlerService) errHandler: ErrorHandlerService){
        super();
        this.errHandler = errHandler;
    }
    key = process.env.APP_KEY || "secret";
    issuer = process.env.APP_KEY_ISSUER || "accounts.localhost";
    audience = process.env.APP_KEY_AUDIENCE || "localhost";
    expiresIn = process.env.APP_TOKEN_EXPIRES_IN || "60m";

    public static isSingleton():boolean {
        return true;
    }

    public static validateAuthFields(email: string, password: string):boolean {
        // validate username:
        email = email.trim();
        if(email === ""){
            return false;
        }
        // validate password:
        password = password.trim();
        if(password === ""){
            return false;
        }
        return true;
    }

    public async login(email:string, password: string, user?:User):Promise<IToken|null>{
        const fieldsValid = AuthService.validateAuthFields(email,password);
        if(!fieldsValid){
            return null;
        }
        if(!user){
            let userModel;
            try {
                userModel = ModelManager.resolveModel('User');
            } catch (e) {
                userModel = User;
            }

            user = <User> await userModel.findOne({ where:{ email: email } }).catch(e => this.errHandler.handle(e));
            if(!user){
                return null;
            }
        }
        const match = await this.comparePassword(password, user.password);
        if(!match){
            return null;
        }
        const payload = {id: user.id, aud: this.audience, iss: this.issuer};
        return {
            access_token: sign(payload, this.key, { expiresIn: this.expiresIn }),
        };
    }

    public comparePassword(password:string, hash:string):Promise<boolean|void>{
        const res = compare(password, hash).catch(e => this.errHandler.handle(e));
        return res;
    }

    public async hashPassword(plainPassword: string): Promise<string|null>{
        const hashed = <string> await hash(plainPassword,3).catch(e => this.errHandler.handle(e));
        if(hashed){
            return hashed;
        }
        return null;
    }
}
