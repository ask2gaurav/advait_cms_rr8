import mongoose from "mongoose";
import { env } from "~/lib/env.server";

const MONGODB_URI = env.MONGODB_URI;

/**
 * Cache the connection across module reloads in dev (Vite / React Router HMR
 * re-evaluates server modules), so we never open more than one pool.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as {
  __mongoose__?: MongooseCache;
};

const cache: MongooseCache =
  globalForMongoose.__mongoose__ ?? { conn: null, promise: null };
globalForMongoose.__mongoose__ = cache;

/** Connect to MongoDB (admin / build only — never import from public routes). */
export async function connectDb(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    mongoose.set("strictQuery", true);
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
