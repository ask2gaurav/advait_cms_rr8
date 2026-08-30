import mongoose from "mongoose";
import { exportContent } from "../app/lib/export.server";

async function main() {
  const meta = await exportContent();
  console.log("✓ exported content/*.json");
  console.table(meta.counts);
  console.log(`  at ${meta.exportedAt}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
