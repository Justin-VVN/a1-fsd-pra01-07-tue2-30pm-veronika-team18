import 'reflect-metadata';
import { AppDataSource } from './data-source';

async function seed() {
  console.log('Initializing database connection...');
  const dataSource = await AppDataSource.initialize();

  try {
    console.log('Dropping all tables...');
    await dataSource.dropDatabase();
    console.log('All tables dropped successfully.');

    console.log('Recreating schema...');
    await dataSource.synchronize();
    console.log('Schema recreated successfully.');

    console.log('\n✅ Database seeded successfully! (schema only, no sample data)');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
