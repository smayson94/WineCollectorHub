import { pgTable, text, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const bins = pgTable("bins", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wines = pgTable("wines", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  binId: integer("bin_id").references(() => bins.id).notNull(),
  name: text("name").notNull(),
  vintage: integer("vintage").notNull(),
  region: text("region").notNull(),
  variety: text("variety").notNull(),
  producer: text("producer").notNull(),
  drinkFrom: integer("drink_from"),
  drinkTo: integer("drink_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  wineId: integer("wine_id").references(() => wines.id).notNull(),
  rating: real("rating").notNull(),
  notes: text("notes"),
  reviewDate: timestamp("review_date").defaultNow().notNull(),
});

export const insertBinSchema = createInsertSchema(bins);
export const selectBinSchema = createSelectSchema(bins);
export type InsertBin = z.infer<typeof insertBinSchema>;
export type Bin = z.infer<typeof selectBinSchema>;

export const insertWineSchema = createInsertSchema(wines);
export const selectWineSchema = createSelectSchema(wines);
export type InsertWine = z.infer<typeof insertWineSchema>;
export type Wine = z.infer<typeof selectWineSchema>;

export const insertReviewSchema = createInsertSchema(reviews);
export const selectReviewSchema = createSelectSchema(reviews);
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = z.infer<typeof selectReviewSchema>;
