import { Kernel } from './kernel/kernel';
import { DatabaseService } from './services/DatabaseService';
import getConfigFromArgs from "./helpers/ConfigHelper";
import {IAppConfig} from "./kernel/interfaces/IAppConfig";

/**
 * Starts the app.
 */
const start = async (config?:IAppConfig|null) => {
    //1. Get the configuration:
    const kernel = new Kernel();
    if(config){
        kernel.setConfig(config);
    }
    else {
        config = getConfigFromArgs();
        kernel.setConfig(config);
    }
    // 2. Boot the app:
    const app = await kernel.boot();
    if (!app) {
        console.error('Failed to start api');
        process.exit(-1);
        return;
    }

    // 3. Connect to Database:
    const db = kernel.getContainer().get(DatabaseService);
    db.init();
    const connection = await db.connect().catch(console.log);
    if (!connection) {
        throw new Error("Failed to connect to database");
    }
    // 4. Listen to connections:
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`API listening on port ${PORT}`);
    });
}

export default start;
