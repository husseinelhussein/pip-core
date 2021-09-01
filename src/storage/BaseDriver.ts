import {IDriverConfig, IStorageConfig} from "./interfaces/IStorageConfig";
import {DriverTrait} from "./interfaces/DriverTrait";

export abstract class BaseDriver extends DriverTrait{
    protected config: IDriverConfig;


    /**
     * Sets the storage config.
     *
     * @param config
     */
    public setConfig(config: IDriverConfig):void {
        this.config = config;
    }
    public abstract getId(): string;

}