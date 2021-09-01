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
          for(const item of items) {
            await item.save();
            await seeder.afterSave(item);
          }
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