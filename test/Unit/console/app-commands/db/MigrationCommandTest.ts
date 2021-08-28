import { suite, test } from "@testdeck/mocha";
import { anything, spy, when, verify, mock, instance, capture } from 'ts-mockito';
import {expect} from "chai";
import { MigrationCommand } from '../../../../../src/console/app-commands/db/MigrationCommand';
import * as Umzug from "umzug";
import { BaseDbCommandTest } from './BaseDbCommandTest';

@suite
export class MigrationCommandTest extends BaseDbCommandTest{

  async before(){
    await this.init(false, true);
  }


  @test
  testInit(){
    // test initializing the migration command:
    const migrationCommand = this.container.resolve(MigrationCommand);
    const config = migrationCommand.init();
    expect(config.options).to.be.an('array');
    expect(config.options).to.length(2);
    const expectedOptions = ['direction', 'file'];
    if (config.options) {
      for (let i = 0; i < expectedOptions.length; i++) {
        expect(config.options[i]).to.be.an('object');
        expect(config.options[i].name).to.equal(expectedOptions[i]);
      }
    }
  }

  @test
  async run(){
    const migrationCommand = this.container.resolve(MigrationCommand);
    const umzugService = migrationCommand.umzugService;
    const spiedUmzugService = spy(umzugService);
    const umzug:Umzug.Umzug = migrationCommand.umzugService.umzug;
    const spiedUmzug = spy(umzug);
    const migrations = this.getMigrations();
    when(spiedUmzug.pending()).thenResolve(migrations);
    when(spiedUmzug.execute(anything())).thenResolve(migrations);
    when(spiedUmzug.up(anything())).thenResolve(migrations);
    when(spiedUmzug.down(anything())).thenResolve(migrations);

    // assert that it runs normally:
    await migrationCommand.run(null,{direction: "up"});
    verify(spiedUmzug.execute(anything())).called();
    verify(spiedUmzugService.getPending()).called();

    // assert that it runs a specific migration file:
    const name = migrations[0].file.replace('.ts','');
    await migrationCommand.run(null, {direction:"up",file:name});
    verify(spiedUmzug.up(name)).called();

    await migrationCommand.run(null,{direction:"down",file:name});
    verify(spiedUmzug.down(name)).called();

    // assert that when called with unknown direction, it throws error
    let err = null;
    await migrationCommand.run(null,{direction:"test"}).catch(e => err = e);
    expect(err).not.null;
    expect(err).to.haveOwnProperty('message');
    expect((err as any).message).to.equal('Direction is not valid, valid directions are: up, down');
  }
}