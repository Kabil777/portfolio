import { generateKeyPairSync } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const id = process.argv[2];
if (!id || !/^[a-z0-9-]+$/.test(id)) {
  throw new Error(
    "Usage: node scripts/generate-admin-key.mjs <lowercase-key-id>",
  );
}

const directory = path.join(process.cwd(), "admin-keys");
const privatePath = path.join(directory, `${id}.pk8.pem`);
const { privateKey, publicKey } = generateKeyPairSync("ed25519");
const privatePem = privateKey.export({ type: "pkcs8", format: "pem" });
const publicPem = publicKey.export({ type: "spki", format: "pem" });

mkdirSync(directory, { recursive: true });
writeFileSync(privatePath, privatePem, {
  encoding: "utf8",
  flag: "wx",
  mode: 0o600,
});

let output = `Private key written to ${privatePath}\n`;
output += "Add this entry under admin.publicKeys in config.yaml:\n\n";
output += `  - id: ${id}\n    publicKey: |-\n`;
for (const line of publicPem.trimEnd().split("\n")) output += `      ${line}\n`;
process.stdout.write(output);
