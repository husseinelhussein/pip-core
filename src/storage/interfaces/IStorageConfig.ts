export interface IDriverConfig {
    id: string
    base_directory: string;
}
export interface IStorageConfig{
    drivers_path?: string;
    default_driver: string;
    drivers: IDriverConfig[];
}