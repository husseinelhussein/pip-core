import {IAppConfig} from "../kernel/interfaces/IAppConfig";
import * as path from "path";

const getConfigFromArgs = (): IAppConfig|null => {
    const args = process.argv.slice(2);
    let config: IAppConfig;
    for(const arg of args){
        if (arg.startsWith('--config=')) {
            const confPath = path.resolve(arg.split('--config=')[1]);
            config = require(confPath);
            return config;
        }
    }
    return null;
}
export default getConfigFromArgs;