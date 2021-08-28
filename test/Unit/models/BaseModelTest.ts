import { BaseUnitTest } from '../BaseUnitTest';
import { suite, test } from "@testdeck/mocha";
import { expect } from "chai";
import ModelB from '../../assets/models/ModelB';
import { Factory } from '../../../src/database/factories/Factory';

@suite
export class BaseModelTest extends BaseUnitTest{

  async before(): Promise<any>{
    await this.init(false, true, true, 'lib_test');
  }

  @test
  async generateUUID(){
    let err = null;
    await Factory.generate(ModelB, 1000, true).catch(e => err = e);
    expect(err).to.be.null;
    const modelB = new ModelB();
    modelB.address_a = "test";
    modelB.address_b = "test";
    await modelB.save().catch(e => err = e);
    expect(err).to.be.null;
    const id = modelB.id;
    modelB.address_a = "test 2";
    await modelB.save().catch(e => err = e);
    expect(err).to.be.null;
    expect(modelB.id).to.equal(id);
  }
}