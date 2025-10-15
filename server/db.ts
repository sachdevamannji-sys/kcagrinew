import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import dotenv from 'dotenv';
dotenv.config();
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const databaseUrl = process.env.DATABASE_URL;

// Check if this is a Neon serverless connection (contains neon.tech)
const isNeonDatabase = databaseUrl.includes('neon.tech') || databaseUrl.includes('neon.aws');

// Initialize database connection based on type
let pool: NeonPool | PgPool;
let db: ReturnType<typeof drizzleNeon<typeof schema>> | ReturnType<typeof drizzlePg<typeof schema>>;

if (isNeonDatabase) {
  // Use Neon serverless with WebSocket support
  neonConfig.webSocketConstructor = ws;
  const neonPool = new NeonPool({ connectionString: databaseUrl });
  pool = neonPool;
  db = drizzleNeon(neonPool, { schema });
  console.log('✅ Connected to Neon Serverless Database (WebSocket)');
} else {
  // Use standard PostgreSQL connection (for localhost/local databases)
  const pgPool = new PgPool({ connectionString: databaseUrl });
  pool = pgPool;
  db = drizzlePg(pgPool, { schema });
  console.log('✅ Connected to Local PostgreSQL Database (TCP)');
}

export { pool, db };
