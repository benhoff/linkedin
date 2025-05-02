import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",   // ← your Drizzle schema definitions
  out:    "./drizzle",            // ← where SQL migrations and snapshots will go
  dialect: "sqlite",              // ← we’re targeting SQLite
  dbCredentials: {
    url: "./dev.db",         // ← SQLite file (will be created automatically)
  },
});

