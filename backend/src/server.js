import app from './app.js';
import { sequelize } from './config/db.js';
import { env } from './config/env.js';
import { seedInitialData } from './config/seed.js';
import './models/index.js';

let server;

try {
  await sequelize.authenticate();

  if (env.nodeEnv === 'development') {
    await sequelize.sync({ alter: env.dbSyncAlter });
    await seedInitialData();
    console.log('Database synced with Sequelize');
  }

  server = app.listen(env.port, () => {
    console.log(`Cosa Nostra API listening on http://localhost:${env.port}`);
  });
} catch (err) {
  console.error('Failed to start Cosa Nostra API');
  console.error(err);
  await sequelize.close();
  process.exit(1);
}

async function shutdown() {
  if (!server) {
    await sequelize.close();
    process.exit(0);
  }

  server.close(async () => {
    await sequelize.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
