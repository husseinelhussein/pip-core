import { QueryInterface } from 'sequelize';
import { Factory } from '../../../../src/database/factories/Factory';
import { BaseSeeder } from '../../../../src/database/seeders/BaseSeeder';
import { injectable } from 'inversify';
import { StaticModel } from "../../../../src/@types/model.t";
import ModelC from '../../models/ModelC';

@injectable()
export class ModelCSeeder extends BaseSeeder<ModelC>{
	protected queryInterface: QueryInterface;

	getOrder(): number {
		return 3;
	}

	getModel(): StaticModel<ModelC>{
		return ModelC;
	}

	setQueryInterface(queryInterface: QueryInterface): void {
		this.queryInterface = queryInterface;
	}

	async up(): Promise<ModelC[]> {
		return await Factory.generate(ModelC,1);
	}

	async down(): Promise<any> {
		await this.queryInterface.bulkDelete('model_c',{});
	}

}
