import {BaseDriver} from "../BaseDriver";
import {injectable} from "inversify";
import {Kernel} from "../../kernel/kernel";
import * as multer from "multer";
import { Request } from "express";
import * as fs from "fs";
declare let kernel: Kernel;
@injectable()
export class LocalPublicDriver extends BaseDriver {
    getId(): string {
        return "local_public";
    }

    async init(): Promise<any> {
        const config = this.config;
        const diskStorage = multer.diskStorage({
            destination: config.base_directory,
            filename: (...args)  => this.generateFileName(...args)
        });
        const uploads = multer({ storage: diskStorage}).any();
        kernel.getApp().use(uploads);
    }

    generateFileName(request: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void):void {
        const ext = "." + file.mimetype.split('/')[1];
        const length = 30;
        let name = this.generateId(length) + ext;
        while(this.fileExists(this.config.base_directory + "/" + name)) {
            name = this.generateId(length) + ext;
        }
        cb(null,  name);
    }

    /**
     *
     * @param length
     */
    generateId(length: number) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }


    /**
     * @inheritDoc
     */
    async delete(path: string): Promise<any> {
        return Promise.resolve(undefined);
    }

    /**
     * @inheritDoc
     */
    async get(path: string): Promise<any> {
        return Promise.resolve(undefined);
    }

    /**
     * @inheritDoc
     */
    async save(data: any, path: string): Promise<any> {
        return Promise.resolve(undefined);
    }

    fileExists(path: string) {
        return fs.existsSync(path);
    }

    /**
     * @inheritDoc
     */
    async exists(path: string): Promise<boolean> {
        return Promise.resolve(false);
    }

}