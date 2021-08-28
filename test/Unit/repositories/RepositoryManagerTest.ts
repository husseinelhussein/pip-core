import { BaseUnitTest } from '../BaseUnitTest';
import { suite,test } from "@testdeck/mocha";
import { expect } from "chai";
import { DatabaseService } from '../../../src/services/DatabaseService';
import seeder from '../../../src/database/listener/SeedListener';
import { RepositoryManager } from '../../../src/repositories/RepositoryManager';
import ModelC from '../../assets/models/ModelC';
import { BaseRepository } from '../../../src/repositories/BaseRepository';

@suite
export class RepositoryManagerTest  extends BaseUnitTest{
  async before(): Promise<any>{
    await this.init(false, true, true, "lib_test");
  }

  @test
  async findRepository(){
    await this.seed();
    // assert getting the repository passing model object:
    let repo;
    repo = RepositoryManager.findRepository(ModelC);
    expect(repo).to.be.instanceOf(BaseRepository);
    // assert getting the repository passing model name:
    repo = RepositoryManager.findRepository("ModelC");
    expect(repo).to.be.instanceOf(BaseRepository);

    // assert that running methods on the repository works:
    const result = await repo.findAll();
    expect(result).to.have.lengthOf(1);
    const modelC = result[0];
    expect(modelC).to.be.instanceOf(ModelC);
  }
}