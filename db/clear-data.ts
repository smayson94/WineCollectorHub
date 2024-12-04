import { db } from "db";
import { reviews, wines, bins } from "@db/schema";
import { sql } from "drizzle-orm";

async function clearDatabaseTables() {
  try {
    // Start a transaction
    await db.transaction(async (tx) => {
      console.log("Starting database cleanup...");
      
      // Clear reviews first (child table)
      console.log("Clearing reviews table...");
      await tx.delete(reviews);
      
      // Clear wines next (middle table)
      console.log("Clearing wines table...");
      await tx.delete(wines);
      
      // Clear bins last (parent table)
      console.log("Clearing bins table...");
      await tx.delete(bins);
      
      console.log("Successfully cleared all tables.");
    });
  } catch (error) {
    console.error("Error clearing database tables:", error);
    throw error;
  }
}

// Execute the cleanup
clearDatabaseTables()
  .then(() => {
    console.log("Database cleanup completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database cleanup failed:", error);
    process.exit(1);
  });
