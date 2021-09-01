import { Express } from "express";

export abstract class DriverTrait{

    /**
     * Initializes the driver.
     */
    public abstract async init(): Promise<any>;

    /**
     * Gets a file in the specified path.
     *
     * @param path the path of the file to get.
     */
    public abstract async get(path: string): Promise<any>;

    /**
     *
     * @param data the data to save.
     * @param path the destination to save the data at.
     */
    public abstract async save(data: any, path: string): Promise<any>;

    /**
     * Deletes a file at the specified path.
     *
     * @param path the path of the file to delete.
     */
    public abstract async delete(path: string): Promise<any>;

    /**
     * Checks whether the file exists at the specified path
     * @param path the path of the file to delete.
     */
    public abstract async exists(path: string): Promise<boolean>;
}