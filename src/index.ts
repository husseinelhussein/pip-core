import { Kernel } from './kernel/kernel';
import { DatabaseService } from './services/DatabaseService';
import getConfigFromArgs from "./helpers/ConfigHelper";

(async () => {
    //1. Get the configuration:
    // 2. Boot the app:
    const kernel = new Kernel();
    const config = getConfigFromArgs();
    if (config) {
        kernel.setConfig(config);
    }
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
})();
