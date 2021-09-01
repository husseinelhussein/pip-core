import { Kernel } from '../kernel/kernel';
import { Manager } from '../container/Manager';
import {Container} from "inversify";
import {Storage} from "./Storage";
import {LocalPublicDriver} from "./drivers/LocalPublicDriver";

declare let kernel: Kernel;
export class StorageDriverManager extends Manager{

    protected static getPath():string{
        const config = kernel.getConfig();
        if (config.storage && config.storage.drivers_path) {
            return config.storage.drivers_path;
        }
        return "";
    }

    /**
     * @inheritDoc
     */
    public static async register(container: Container){
        let drivers = [];
        if (this.getPath().length) {
            drivers = await super.register(container);
        }
        container.bind(LocalPublicDriver).toSelf();
        container.bind('local_public').toConstantValue(container.resolve(LocalPublicDriver));
        container.bind(Storage).toSelf();
        drivers.push(LocalPublicDriver);

        const resolved_drivers = [];
        for(const driver of drivers){
            const resolved = container.resolve(driver);
            resolved_drivers.push(resolved);
        }
        container.bind('AllStorageDrivers').toConstantValue(resolved_drivers);
        return drivers;
    }

}