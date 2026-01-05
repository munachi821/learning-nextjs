import mongoose, { Connection } from "mongoose";

/*
 * A global cache to store the mongoose connection and connection promise.
 * This prevents creating multiple connections during hot-reloads in
 * development (Next.js dev server, serverless re-invocations, etc.).
 *
 * We attach the cache to the `global` object and provide a typed
 * declaration below so we avoid using `any`.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: Connection | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

// Use the environment variable `MONGODB_URI` to configure the connection.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * connectToDatabase
 *
 * Establishes a connection to MongoDB using mongoose and caches the
 * connection across module reloads. Returns an object containing the
 * active mongoose `Connection` and the `mongoose` instance for model
 * usage.
 *
 * The function is safe to call multiple times; concurrent callers will
 * reuse the same connection promise.
 */
export async function connectToDatabase(): Promise<{
  conn: Connection;
  mongoose: typeof mongoose;
}> {
  // Return cached connection if it exists
  if (global.mongooseCache?.conn) {
    return { conn: global.mongooseCache.conn, mongoose };
  }

  // Create the cache container on the global object when missing
  if (!global.mongooseCache) {
    global.mongooseCache = { conn: null, promise: null };
  }

  // If there's no connection promise, create one. This ensures multiple
  // calls while a connection is being established reuse the same promise.
  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose
      .connect(MONGODB_URI!)
      .then((mongooseInstance) => {
        global.mongooseCache!.conn = mongooseInstance.connection;
        return mongooseInstance;
      });
  }

  // Await the connection promise and return the connection and mongoose
  const mongooseInstance = await global.mongooseCache.promise;
  return { conn: mongooseInstance.connection, mongoose };
}

export default connectToDatabase;
