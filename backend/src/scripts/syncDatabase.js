import { sequelize } from '../config/db.js';
import { env } from '../config/env.js';
import { seedInitialData } from '../config/seed.js';
import '../models/index.js';

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: env.dbSyncAlter });
  await seedInitialData();
  console.log('Database synced with Sequelize');
} catch (err) {
  console.error('Failed to sync database');
  console.error(err);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
