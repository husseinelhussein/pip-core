import { QueryInterface } from 'sequelize';
import { SeedManager } from '../seeders/SeedManager';

const seeder = {
  up: async (queryInterface: QueryInterface) => {
    const seeders = await SeedManager.getSeeders(queryInterface);
    if (seeders) {
      for (const seeder of seeders) {
        seeder.setQueryInterface(queryInterface);
        const items = await seeder.up();
        if (items) {
          const rawItems = [];
          for (const item of items) {
            rawItems.push(item.toJSON());
          }
          const model = seeder.getModel();
          await model.bulkCreate(rawItems);
        }
      }
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const seeders = await SeedManager.getSeeders(queryInterface).catch(console.log);
    if (seeders) {
      for (const seeder of seeders) {
        seeder.setQueryInterface(queryInterface);
        await seeder.down();
      }
    }
  }
};

export default seeder;