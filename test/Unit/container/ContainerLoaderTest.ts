import { suite, test } from "@testdeck/mocha";
import { expect } from "chai";
import { BaseUnitTest } from '../BaseUnitTest';
import { Kernel } from '../../../src/kernel/kernel';
import { DatabaseService } from '../../../src/services/DatabaseService';
import { Serializer } from '../../../src/serializer/Serializer';
import { QueryParser } from '../../../src/router/QueryParser';
import { Container as BaseContainer } from 'inversify';
import { ModelARepository } from '../../assets/repositories/ModelARepository';
import { ModelAResource } from '../../assets/resources/ModelAResource';
import { ModelAController } from '../../assets/controllers/ModelAController';
import { ModelAFactory } from '../../assets/database/factories/ModelAFactory';
import { ModelASeeder } from '../../assets/database/seeders/ModelASeeder';
import { TestCommand } from '../../assets/console/TestCommand';
import { Sequelize } from 'sequelize-typescript';
import { MyService } from '../../assets/services/MyService';
@suite
export class ContainerLoaderTest extends BaseUnitTest{

  @test
  async register(){
    const kernel = new Kernel();
    await kernel.boot('lib_test');
    const container = kernel.getContainer();

    /** Connect to Database */
    const db_ser:DatabaseService = container.get(DatabaseService);
    db_ser.init();
    const db = <Sequelize> await db_ser.connect().catch(console.log);


    // assert logger:
    const logger = container.get('LoggerService');
    expect(logger).not.to.be.null;

    // assert serializer is registered:
    const serializer = container.get(Serializer);
    expect(serializer).not.to.be.null;

    // assert QueryParser is registered:
    const qp = container.get(QueryParser);
    expect(qp).not.to.be.null;

    // assert baseContainer is registered:
    const baseContainer = container.get(BaseContainer);
    expect(baseContainer).not.to.be.null;

    //services should be registered:
    const my_service = container.get(MyService);
    expect(my_service).not.to.be.null;

    // repositories should be registered:
    const repo = container.get(ModelARepository);
    expect(repo).not.to.be.null;

    // resources should be registered:
    const resource = container.get(ModelAResource);
    expect(resource).not.to.be.null;

    // controllers should be registered:
    const controller = container.get(ModelAController);
    expect(controller).not.to.be.null;

    // factories should be registered:
    const factory = container.get(ModelAFactory);
    expect(factory).not.to.be.null;

    // seeders should be registered:
    const seeder = container.get(ModelASeeder);
    expect(seeder).not.to.be.null;

    // commands should be registered:
    const command = container.get(TestCommand);
    expect(command).not.to.be.null;

    const allCommands = container.get('AllCommands');
    expect(allCommands).to.have.lengthOf(5);

    // commands should be registered:
    const importer = container.get('AllImporters');
    expect(importer).to.have.lengthOf(2);
  }

}