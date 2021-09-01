import "reflect-metadata";
import { Container as BaseContainer } from 'inversify';
import logger from '../logger';
import { Logger as BaseLogger } from 'winston';
import { ServiceManager } from '../services/ServiceManager';
import { RepositoryManager } from '../repositories/RepositoryManager';
import { ControllerManager } from '../controller/ControllerManager';
import { ResourceManager } from '../resources/ResourceManager';
import { Serializer } from '../serializer/Serializer';
import { QueryParser } from '../router/QueryParser';
import { ModelManager } from '../models/ModelManager';
import { FactoryManager } from '../database/factories/FactoryManager';
import { SeedManager } from '../database/seeders/SeedManager';
import { CommandManager } from '../console/CommandManager';
import {StorageDriverManager} from "../storage/StorageDriverManager";

export class ContainerLoader{
    public static async register(){
        const container = new BaseContainer({skipBaseClassChecks: true});
        // register Logger
        container.bind<BaseLogger>("LoggerService").toConstantValue(logger);

        // register Serializer:
        container.bind<Serializer>(Serializer).to(Serializer);

        // Register QueryParser:
        container.bind<QueryParser>(QueryParser).toSelf();

        // register the container itself:
        container.bind<BaseContainer>(BaseContainer).toConstantValue(container);

        // Register services:
        await ServiceManager.register(container);

        // Register the repositories:
        await RepositoryManager.register(container, true);

        // Register the resources:
        await ResourceManager.register(container);

        // Register the controllers:
        await ControllerManager.register(container, true);

        // Register the models:
        await ModelManager.register(container);

        // Register the factories:
        await FactoryManager.register(container, true);

        // Register the seeders:
        await SeedManager.register(container, true);

        // Register commands:
        await CommandManager.register(container);

        // Register Storage Drivers:
        await StorageDriverManager.register(container);

        return container;
    }
}