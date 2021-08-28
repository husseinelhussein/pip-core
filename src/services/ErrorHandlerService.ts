import { inject, injectable } from 'inversify';
import { Logger } from 'winston';
import { IFieldError } from '../repositories/interfaces/IEntityValError';

@injectable()
export class ErrorHandlerService{
    protected logger: Logger;
    constructor(@inject("LoggerService") loggerService: Logger){
        this.logger = loggerService;
    }
    public handle(err: any, message = ""){
        let msg = message;
        if(err instanceof Error){
            msg = err.message;
        }
        this.logger.error(msg, err);
    }

    public generateErrorResource(error: any):IFieldError{
        let name = "";
        if(error.hasOwnProperty('name')){
            name = error.name;
        }else if(error.hasOwnProperty('title')){
            name = error.title;
        }else{
            name = error.message;
        }
        const err = <IFieldError> {
            title: name,
            detail: error.message,
            status: error.hasOwnProperty('status')? error.status: 0,
            source: {
                pointer: "",
            }
        };
        return err;
    }
}