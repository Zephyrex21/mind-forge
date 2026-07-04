import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb } from './connection.js';

/**
 * Dev utility: wipe all collections for a clean local database.
 * Run with: npm run db:reset
 */
async function reinit() {
  await connectDb();
  const collections = await mongoose.connection.db.listCollections().toArray();

  if (!collections.length) {
    console.log('No collections found — database is already empty.');
  } else {
    for (const { name } of collections) {
      await mongoose.connection.db.collection(name).deleteMany({});
      console.log(`Cleared collection: ${name}`);
    }
  }

  await mongoose.connection.close();
  console.log('Done.');
  process.exit(0);
}

reinit().catch((err) => {
  console.error('Reset failed:', err.message);
  process.exit(1);
});
