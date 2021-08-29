import { BaseDbCommandTest } from './BaseDbCommandTest';
import { suite, test } from "@testdeck/mocha";
import { expect } from 'chai';

@suite
export class OtherDbCommandTest extends BaseDbCommandTest{

  async before(): Promise<void> {
    await this.init(false, true);
  }

  @test
  async run(){
    // test seeding:
    let err = null;
    const res = await this.callCommand(['sequelize db:model:generate', '-c', true, '--name', 'User', '--attributes', 'firstName:string,lastName:string,email:string']).catch(e => err = e);
    expect(err).to.be.null;
    expect(res).not.to.be.null
  }
}