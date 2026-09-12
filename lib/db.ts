import postgres from "postgres";

export type Database = ReturnType<typeof postgres>;

const globalForDatabase = globalThis as typeof globalThis & {
  portfolioDatabase?: Database;
};
let database: Database | undefined;

export function getDatabase(): Database {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  database ??=
    globalForDatabase.portfolioDatabase ??
    postgres(databaseUrl, {
      max: process.env.NODE_ENV === "production" ? 5 : 10,
      prepare: false,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDatabase.portfolioDatabase = database;
  }

  return database;
}

export async function closeDatabase(): Promise<void> {
  if (database) await database.end();
  database = undefined;
  globalForDatabase.portfolioDatabase = undefined;
}
