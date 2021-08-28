import { BaseUnitTest } from '../BaseUnitTest';
import { suite, test } from "@testdeck/mocha";
import { expect } from "chai";
import { spy, when } from "ts-mockito";

@suite
export class ImporterServiceTest extends BaseUnitTest{
  async before(): Promise<any>{
    await this.init(false, true);
  }

  @test
  auth(){

  }
}