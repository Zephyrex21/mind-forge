import mongoose from 'mongoose';

/**
 * MongoDB connection manager (Mongoose).
 * Single shared connection reused across the whole Express app.
 */
let connectionPromise = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * A single connection attempt (no retry) — separated out so the retry
 * loop in connectDb() can call it repeatedly without duplicating the
 * actual mongoose.connect() logic.
 */
async function attemptConnect(uri) {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  console.log(`[DB] Connected to MongoDB (${conn.connection.name})`);
  return conn.connection;
}

/**
 * Connects with retry + exponential backoff on the *initial* connection —
 * a transient DNS hiccup or a moment of Atlas cluster unavailability at
 * boot shouldn't crash-loop the whole container on the first failure.
 * Once connected, ongoing reconnection is handled by the MongoDB driver's
 * own topology monitoring (that part doesn't need reimplementing here).
 *
 * `maxRetries` and `baseDelayMs` are parameters (not hardcoded) so tests
 * can exercise the retry logic without actually waiting through real
 * multi-second delays.
 */
export async function connectDb({ maxRetries = 5, baseDelayMs = 1000 } = {}) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set. Copy .env.example to .env and add your MongoDB connection string.');
    }

    connectionPromise = (async () => {
      let lastErr;
      for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
        try {
          return await attemptConnect(uri);
        } catch (err) {
          lastErr = err;
          if (attempt < maxRetries) {
            const delay = baseDelayMs * 2 ** (attempt - 1); // 1s, 2s, 4s, 8s...
            console.warn(`[DB] Connection attempt ${attempt}/${maxRetries} failed (${err.message}). Retrying in ${delay}ms...`);
            await sleep(delay);
          }
        }
      }
      throw lastErr;
    })().catch((err) => {
      connectionPromise = null; // allow a fresh retry sequence on the next call
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

/**
 * Closes the connection cleanly — used by the graceful-shutdown handler
 * (see shutdown.js) so an in-progress deploy doesn't leave a dangling
 * connection on the database side.
 */
export function closeDb() {
  return mongoose.connection.close(false);
}

export default connectDb;
