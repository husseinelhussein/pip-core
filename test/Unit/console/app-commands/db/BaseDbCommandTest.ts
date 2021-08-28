import { BaseCommandTest } from '../../BaseCommandTest';
import { resolve } from "path";
import { Migration } from 'umzug';

export class BaseDbCommandTest extends BaseCommandTest{

  getMigrations():Array<Migration>{
    const fileName = '1-model-a.ts';
    const path = resolve(this.kernel.getConfig().migrations_path,'./' + fileName);
    const migration = <Migration> {
      file: fileName,
    };
    return [migration];
  }
}