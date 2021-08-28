import { QueryInterface } from 'sequelize';
import { Factory } from '../../../../src/database/factories/Factory';
import ModelA from '../../models/ModelA';
import { BaseSeeder } from '../../../../src/database/seeders/BaseSeeder';
import { injectable } from 'inversify';
import {StaticModel} from "../../../../src/@types/model.t";

@injectable()
export class ModelASeeder extends BaseSeeder<ModelA>{
	protected queryInterface: QueryInterface;

	getOrder(): number {
		return 2;
	}

	getModel(): StaticModel<ModelA>{
		return ModelA;
	}

	setQueryInterface(queryInterface: QueryInterface): void {
		this.queryInterface = queryInterface;
	}

	async up(): Promise<ModelA[]> {
		return await Factory.generate(ModelA,1);
	}

	async down(): Promise<any> {
		await this.queryInterface.bulkDelete('model_a',{});
	}

}
