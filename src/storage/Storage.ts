import {BaseDriver} from "./BaseDriver";
import {injectable} from "inversify";
import {Kernel} from "../kernel/kernel";
import {IDriverConfig, IStorageConfig} from "./interfaces/IStorageConfig";
import {DriverTrait} from "./interfaces/DriverTrait";
import { Express } from "express";

declare let kernel: Kernel;

@injectable()
export class Storage extends DriverTrait {
    protected current_driver: BaseDriver;
    protected drivers: BaseDriver[];

    /**
     * Initializes the storage.
     */
    public async init(): Promise<any> {
        const container = kernel.getContainer();
        const config = kernel.getConfig();
        const default_config: IStorageConfig = {
            default_driver: "local_public",
            drivers: [
                {
                    id: "local_public",
                    base_directory: "/"
                }
            ],
        };
        const storage_config:IStorageConfig = config.storage? config.storage: default_config;
        this.drivers = container.get('AllStorageDrivers');
        let current_driver_config: IDriverConfig| null = null;
        for (const driverConf of storage_config.drivers) {
            if (storage_config.default_driver === driverConf.id) {
                current_driver_config = driverConf;
            }
        }
        if (!current_driver_config) {
            throw Error('No configuration found for the default storage driver!');
        }
        await this.setCurrentDriver(storage_config.default_driver, current_driver_config);
    }

    private async setCurrentDriver(id: string, config: IDriverConfig){
        let found = false;
        for (const driver of this.drivers) {
            if(driver.getId()) {
                this.current_driver = driver;
                this.current_driver.setConfig(config);
                await this.current_driver.init();
                found = true;
                break;
            }
        }
        if (!found) {
            throw Error('Storage Driver with the ID "' + id + '" could not be found!');
        }
    }

    /**
     * @inheritDoc
     */
    async delete(path: string): Promise<any> {
        return this.current_driver.delete(path);
    }

    /**
     * @inheritDoc
     */
    async get(path: string): Promise<any> {
        return this.current_driver.get(path);
    }

    /**
     * @inheritDoc
     */
    async save(data: any, path: string): Promise<any> {
        return this.current_driver.save(data, path);
    }

    /**
     * @inheritDoc
     */
    async exists(path: string): Promise<boolean> {
        return this.current_driver.exists(path);
    }
}