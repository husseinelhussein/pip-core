import { QueryInterface } from 'sequelize';
import { Factory } from '../../../../src/database/factories/Factory';
import { BaseSeeder } from '../../../../src/database/seeders/BaseSeeder';
import { injectable } from 'inversify';
import { StaticModel } from "../../../../src/@types/model.t";
import ModelB from '../../models/ModelB';

@injectable()
export class ModelBSeeder extends BaseSeeder<ModelB>{
	protected queryInterface: QueryInterface;

	getOrder(): number {
		return 1;
	}

	getModel(): StaticModel<ModelB>{
		return ModelB;
	}

	setQueryInterface(queryInterface: QueryInterface): void {
		this.queryInterface = queryInterface;
	}

	async up(): Promise<ModelB[]> {
		return await Factory.generate(ModelB,1);
	}

	async down(): Promise<any> {
		await this.queryInterface.bulkDelete('model_b',{});
	}

}
