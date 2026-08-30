import { config } from "dotenv";

/**
 * Load `.env` into `process.env` for server-side code. Safe to import multiple
 * times. The `.env` file is local-only and never shipped to production (the
 * public site is fully static and has no server).
 */
config();

export const env = {
  MONGODB_URI: process.env.MONGODB_URI ?? "mongodb://localhost:27017/cms",
  SESSION_SECRET: process.env.SESSION_SECRET ?? "",
  SITE_URL: process.env.SITE_URL ?? "https://example.com",
  MAX_UPLOAD_MB: Number(process.env.MAX_UPLOAD_MB ?? 10),
  NODE_ENV: process.env.NODE_ENV ?? "development",
};
