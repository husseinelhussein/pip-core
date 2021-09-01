import {
    BeforeSave,
    Column,
    DataType,
    Table,
    TableOptions,
} from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { IsString, Required, IsBoolean } from '../validation';
import { Kernel } from '../kernel/kernel';
import { ErrorHandlerService } from "../services/ErrorHandlerService";
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
declare let kernel: Kernel;
const options: TableOptions = {
    tableName: "users",
    modelName: "User",
    timestamps: true,
    paranoid: true,
    underscored: true,
};
@Table(options)
export default class User extends BaseModel<User>{
    protected static messages: any = {
        email: "Please enter a valid E-mail address",
        emailExists: "E-mail is already exist",
        password: "Please enter a valid password",
    };
    public hiddenAttributes: Array<string> = ['deletedAt','password'];

    @IsBoolean()
    @Column(DataType.BOOLEAN)
    public active: boolean;

    @Column(DataType.DATE)
    public createdAt: string;

    @Column(DataType.DATE)
    public updatedAt: string;

    @Required()
    @Column({
        type: DataType.STRING,
        validate: {
            isEmail: { msg: User.messages.email},
            notNull: { msg: User.messages.email},
            isUnique: User.isUnique
        },
        allowNull: false,
        unique: {name: "email", msg: User.messages.emailExists},
    })
    public email: string;

    @Required()
    @Column({
        type: DataType.TEXT,
        validate: {
            notEmpty: { msg: User.messages.password},
            notNull: { msg: User.messages.password }
        },
        allowNull: false,
    })
    get password(): string{
        return this.getDataValue('password');
    }

    set password(password: string){
        this.setDataValue('password',password);
    }
    public static async isUnique(email: string): Promise<boolean>{
        const changed = (this as any).changed('email');
        if (changed) {
            const container = kernel.getContainer();
            const errHandler = container.resolve(ErrorHandlerService);
            const userRepo = container.resolve(UserRepository);
            const exists = await userRepo.findByEmail(email).catch(e => errHandler.handle(e));
            if (exists) {
                throw new Error(User.messages.emailExists);
            }
        }
        return true;
    }

    @BeforeSave
    static async hashPassword(instance: User, options: any){
        const container = kernel.getContainer();
        const errHandler = container.resolve(ErrorHandlerService);
        const authSer:AuthService = container.resolve(AuthService);
        const prevHash = instance.previous('password');
        if(!prevHash){
            // on new user, prev is empty:
            const hashed = await authSer.hashPassword(instance.password).catch(e => errHandler.handle(e));
            if(hashed){
                instance.password = hashed;
            }
            return null;
        }
        const match = await authSer.comparePassword(instance.password, prevHash).catch(e  => errHandler.handle(e));
        // if the password doesn't match, it means we need to change it:
        if (!match) {
            const hashed = await authSer.hashPassword(instance.password).catch(e => errHandler.handle(e));
            if(hashed){
                instance.password = hashed;
            }
        }
        else {
            // this is the same password so ignore it:
            instance.changed('password', false);
        }
    }
}
