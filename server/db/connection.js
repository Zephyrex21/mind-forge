import mongoose from 'mongoose';

/**
 * MongoDB connection manager (Mongoose).
 * Single shared connection reused across the whole Express app.
 */
let connectionPromise = null;

export async function connectDb() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set. Copy .env.example to .env and add your MongoDB connection string.');
    }

    mongoose.set('strictQuery', true);

    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10_000,
    }).then((conn) => {
      console.log(`[DB] Connected to MongoDB (${conn.connection.name})`);
      return conn.connection;
    }).catch((err) => {
      connectionPromise = null; // allow retry on next call
      throw err;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB connection lost');
    });
    mongoose.connection.on('error', (err) => {
      console.error('[DB] MongoDB connection error:', err.message);
    });
  }

  return connectionPromise;
}

/**
 * Returns the live mongoose connection. Assumes connectDb() has already
 * resolved once at server startup (see index.js).
 */
export function getDb() {
  return mongoose.connection;
}

export default connectDb;
