import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

// NOTE: We are using In-Memory Storage for this MVP as requested.
// This DB connection is a placeholder to satisfy the template structure 
// but will not be used for storage.

const { Pool } = pg;

// Dummy pool for types, we won't connect unless DATABASE_URL is set
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "postgres://dummy:dummy@localhost:5432/dummy" 
});

// We export db but we won't use it in MemStorage
export const db = drizzle(pool, { schema });
