import { suite, test } from "@testdeck/mocha";
import { anything, spy, when, verify } from 'ts-mockito';
import { CommandManager } from '../../../src/console/CommandManager';
import { BaseCommandTest } from './BaseCommandTest';
import { TestCommand } from '../../assets/console/TestCommand';
import {expect} from "chai";
import { BaseCommand } from '../../../src/console/BaseCommand';
import { Kernel } from '../../../src/kernel/kernel';
import { resolve } from 'path';
@suite
export class CommandManagerTest extends BaseCommandTest{

  async before(){
    await this.init(false, true);
  }

  @test
  async getCommands(){
    const commands:any[] = this.container.get('AllCommands');
    const returnedCommands = CommandManager.getCommands();
    expect(returnedCommands).to.be.an('array');
    expect(returnedCommands).to.length(commands.length);
    for(const command of returnedCommands){
      expect(command).to.be.instanceOf(BaseCommand);
    }
  }

  @test
  async initCommands(){
    // spy on the command:
    const command = new TestCommand();
    const options = command.init();
    // spy on the "CommanderJs":
    const program = this.initCommander();
    const sub_program = program.command(command.getName());
    const spied_sub_program = spy(sub_program);
    const spiedCommand = spy(command);
    const spiedProgram = spy(program);
    when(spiedProgram.command(anything())).thenCall(() => {
      return sub_program;
    });
    // spy on the manager:
    const spiedManager = spy(CommandManager);
    when(spiedManager.getCommands()).thenReturn([command]);
    await CommandManager.initCommands(program);

    // assert calls:

    verify(spiedManager.getCommands()).called();
    verify(spiedCommand.init()).called();
    verify(spiedProgram.command(command.getName())).called();
    verify(spied_sub_program.name(command.getName())).called();
    verify(spied_sub_program.usage(anything())).called();
    if(options.description){
      verify(spied_sub_program.description(options.description,options.argsDescription)).called();
    }
    if(options.options){
      const length = options.options.length;
      verify(spied_sub_program.option(anything(),anything(),anything())).atLeast(length);
    }
    verify(spied_sub_program.action(anything())).called();

    // add the option to the program
    //const stop = null;
    const node_path = process.argv[0];
    const console_path = resolve(Kernel.getRoodDir() + '/src/lib/console');
    const args = [node_path, console_path,'my_command','--option_a','option_a_value'];
    await program.parseAsync(args);
    verify(spiedCommand.run(anything(),anything(),anything())).called();
  }
}