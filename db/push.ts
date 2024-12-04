import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql, { schema });

async function push() {
  try {
    console.log("Starting database schema push...");
    await db.insert(schema.bins).values({
      name: "Sample Bin",
      location: "Cellar",
      capacity: 10,
      description: "Sample bin for testing"
    }).onConflictDoNothing();
    console.log("Schema push completed successfully");
  } catch (error) {
    console.error("Error during schema push:", error);
    process.exit(1);
  }
  process.exit(0);
}

push();
