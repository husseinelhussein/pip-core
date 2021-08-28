import { BaseUnitTest } from '../../BaseUnitTest';
import { suite, test } from "@testdeck/mocha";
import { DatabaseService } from '../../../../src/services/DatabaseService';
import seeder from "../../../../src/database/listener/SeedListener";

@suite
export class SeedListenerTest extends BaseUnitTest{
  async before(): Promise<any>{
    await this.init(false, true);
  }

  @test
  async up(){
    const dbService = this.container.get(DatabaseService);
    const queryInterface = dbService.getDatabase().getQueryInterface();
    await seeder.up(queryInterface);
  }

}