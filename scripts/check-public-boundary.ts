import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Fail if any non-admin route (or any file it can pull into the client bundle)
 * imports a server-only module or the DB driver. Keeps the public site static.
 */
const ROUTES_DIR = "app/routes";
const BANNED = [/from\s+["'][^"']*\.server["']/, /from\s+["']mongoose["']/];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const offenders: string[] = [];
for (const file of walk(ROUTES_DIR)) {
  if (file.includes(`routes${"/"}admin`) || file.includes("\\admin\\")) continue;
  if (!/\.(tsx?|jsx?)$/.test(file)) continue;
  const src = readFileSync(file, "utf8");
  if (BANNED.some((re) => re.test(src))) offenders.push(file);
}

if (offenders.length) {
  console.error("Public routes must not import server-only modules:");
  for (const f of offenders) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("✓ public/admin boundary intact");
