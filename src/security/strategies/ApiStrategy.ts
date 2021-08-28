import {Strategy} from "passport-strategy";
import {
    ExtractJwt,
    Strategy as JwtStrategy,
    StrategyOptions,
    VerifiedCallback,
} from 'passport-jwt';
import { IBaseStrategy } from '../interfaces/IBaseStrategy';
import User from '../../models/User';

export class ApiStrategy implements IBaseStrategy{
    protected name = "api_auth";
    public getStrategy(): Strategy {
        const options: StrategyOptions = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.APP_KEY || "secret",
            issuer: process.env.APP_KEY_ISSUER || "accounts.localhost",
            audience: process.env.APP_KEY_AUDIENCE || "localhost",
        };
        new Strategy();
        return new JwtStrategy(options, this.verify);
    }

    public getName(): string{
        return this.name;
    }

    public async verify(payload: any, done: VerifiedCallback): Promise<undefined>{
        // get the user from db:
        const userId = payload.id;
        if(!userId){
            const err = new Error("Payload does not have a user id");
            done(err,null,"Forbidden");
            return;
        }
        // todo: get the user from the repository instead:
        const user = <User> await User.findByPk(userId).catch(console.log);
        if(!user){
            const err = new Error("Forbidden");
            done(err,null);
            return;
        }
        done(null,user);
        return;
    }
}