import { suite, test } from "@testdeck/mocha";
import { expect } from "chai";
import { BaseCommandTest } from './BaseCommandTest';

@suite
export class IndexTest extends BaseCommandTest{

  @test
  async index(){
    let err = null;
    const res = await this.callCommand(['my_command', '--option-a=a']).catch(e => err = e);
    expect(err).to.be.null;
    expect(res).not.to.be.null
    expect(res).not.to.be.undefined
    return true;
  }
}