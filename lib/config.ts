import { createPublicKey } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

export type SiteConfig = {
  projects: Array<{
    title: string;
    description: string;
    outcome: string;
    tags: string[];
    tone: string;
  }>;
  experience: Array<{ period: string; role: string; detail: string }>;
  contact?: { email?: string; linkedin?: string };
  site: { url: string };
  admin: { publicKeys: Array<{ id: string; publicKey: string }> };
  newsletter: { from: string; ownerEmail: string };
};

let cachedConfig: SiteConfig | undefined;

function requiredString(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required in config.yaml`);
  }
  return value.trim();
}

export function getSiteConfig(): SiteConfig {
  if (cachedConfig) return cachedConfig;

  const data = parse(
    readFileSync(path.join(process.cwd(), "config.yaml"), "utf8"),
  ) as Partial<SiteConfig>;
  const publicKeys = data.admin?.publicKeys;
  if (!Array.isArray(publicKeys) || publicKeys.length < 2) {
    throw new Error("admin.publicKeys must contain primary and backup keys");
  }

  const ids = new Set<string>();
  for (const key of publicKeys) {
    key.id = requiredString(key.id, "admin.publicKeys[].id");
    key.publicKey = requiredString(
      key.publicKey,
      `admin.publicKeys.${key.id}.publicKey`,
    );
    if (ids.has(key.id)) throw new Error(`Duplicate admin key id: ${key.id}`);
    ids.add(key.id);
    createPublicKey(key.publicKey);
  }

  if (!Array.isArray(data.projects) || !Array.isArray(data.experience)) {
    throw new Error("projects and experience are required in config.yaml");
  }

  cachedConfig = {
    ...data,
    projects: data.projects,
    experience: data.experience,
    site: {
      url: requiredString(
        process.env.SITE_URL ?? data.site?.url,
        "site.url",
      ).replace(/\/$/, ""),
    },
    admin: { publicKeys },
    newsletter: {
      from: requiredString(
        process.env.NEWSLETTER_FROM ?? data.newsletter?.from,
        "newsletter.from",
      ),
      ownerEmail: requiredString(
        process.env.NEWSLETTER_OWNER_EMAIL ?? data.newsletter?.ownerEmail,
        "newsletter.ownerEmail",
      ),
    },
  };

  return cachedConfig;
}
