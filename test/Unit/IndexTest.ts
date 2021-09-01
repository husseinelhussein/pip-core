import { suite, test } from "@testdeck/mocha";
import { expect } from "chai";
import { BaseUnitTest } from './BaseUnitTest';
import { resolve } from "path";
import { Kernel } from '../../src/kernel/kernel';
import { ForkOptions } from "child_process";
import * as cp from "child_process";

@suite()
export class IndexTest extends BaseUnitTest{
    async before(){
        await this.init(false, false);
    }

    @test()
    /**
     * Tests running the app.
     */
    async testIndex(): Promise<any>{
        const run = new Promise(async (res, reject) => {
            const path = resolve(Kernel.getRootDir(), './src/console');
            const options: ForkOptions = {
                silent: false,
                execArgv: ['-r', 'ts-node/register','--inspect'],
                env: process.env,
            };
            const appArgs = [
                '--config=' + resolve(__dirname, './../assets/env/lib_test.config')
            ];
            const child = cp.fork(path, appArgs, options);
            child.on('error', (err) => {
                reject(err);
            })
            child.once('message', (message:any, sendHandle) => {
                const isBoolean = typeof message === 'boolean';
                if(isBoolean && message){
                    res(message);
                }
                else {
                    reject(message);
                }
            });

        });

        let err = null;
        const result = await run.catch(e => err = e);
        expect(err).to.be.null;
        expect(result).not.to.be.null
        expect(result).not.to.be.undefined
    }
}