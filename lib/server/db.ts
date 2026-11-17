import mongoose from "mongoose";

/**
 * One shared MongoDB connection for the whole server. In development Next.js reloads modules on every change, so the
 * connection is kept on `globalThis` instead of being opened again each time.
 */
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalCache = globalThis as unknown as { __kpMongo?: Cache };
const cache: Cache = globalCache.__kpMongo ?? (globalCache.__kpMongo = { conn: null, promise: null });

/** Whether a database is configured (MONGODB_URI is set). Without one, public pages fall back to data/*.ts. */
export const hasDatabase = () => Boolean(process.env.MONGODB_URI);

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local (local) or the Render environment (live).");
  if (cache.conn) return cache.conn;
  cache.promise ??= mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 10_000 });
  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
  return cache.conn;
}