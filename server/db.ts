// server/db.ts
import ws from "ws";
import * as schema from "@shared/schema";

// Neon-Serverless for production
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig }     from "@neondatabase/serverless";

// LibSQL client + Drizzle for SQLite
import { createClient }           from "@libsql/client";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";

// Wire up Neon’s WebSocket constructor
neonConfig.webSocketConstructor = ws;

// Decide which DB to export
export const db =
  process.env.NODE_ENV === "development"
    ? drizzleLibsql(
        createClient({ url: "file:./dev.db" }), // auto-creates dev.db
        { schema }
      )
    : (() => {
        if (!process.env.DATABASE_URL) {
          throw new Error("DATABASE_URL must be set for production!");
        }
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        return drizzleNeon({ client: pool, schema });
      })();

