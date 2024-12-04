import fs from "fs";
import express, { type Express } from "express";
import { db } from "db";
import { bins, wines, reviews } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { upload, processImage } from "./upload";
import path from "path";

export function registerRoutes(app: Express) {
  // Serve uploaded files
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));
  // Bins
  app.get("/api/bins", async (req, res) => {
    try {
      const allBins = await db.select().from(bins).orderBy(desc(bins.createdAt));
      res.json(allBins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bins" });
    }
  });

  app.post("/api/bins", async (req, res) => {
    try {
      const newBin = await db.insert(bins).values(req.body).returning();
      res.json(newBin[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create bin" });
    }
  });

  // Wines
  app.get("/api/wines", async (req, res) => {
    try {
      const allWines = await db.select().from(wines).orderBy(desc(wines.createdAt));
      res.json(allWines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wines" });
    }
  });

  app.post("/api/wines", upload.single("image"), async (req, res) => {
    try {
      const wineData = typeof req.body.wine === 'string'
        ? JSON.parse(req.body.wine)
        : req.body.wine;

      // Add image URLs if an image was uploaded
      if (req.file) {
        const { imageUrl, thumbnailUrl } = await processImage(req.file);
        wineData.imageUrl = imageUrl;
        wineData.thumbnailUrl = thumbnailUrl;
      }

      const newWine = await db.insert(wines).values(wineData).returning();
      res.json(newWine[0]);
    } catch (error) {
      console.error('Wine creation error:', error);
      res.status(500).json({ error: "Failed to create wine" });
    }
  });

  app.put("/api/wines/:id", upload.single("image"), async (req, res) => {
    try {
      const wineData = typeof req.body.wine === 'string'
        ? JSON.parse(req.body.wine)
        : req.body;

      // Remove id and createdAt from update data
      const { id, createdAt, ...updateData } = wineData;

      if (req.file) {
        const { imageUrl, thumbnailUrl } = await processImage(req.file);
        updateData.imageUrl = imageUrl;
        updateData.thumbnailUrl = thumbnailUrl;
      }

      const wine = await db.update(wines)
        .set(updateData)
        .where(eq(wines.id, parseInt(req.params.id)))
        .returning();
      res.json(wine[0]);
    } catch (error) {
      console.error('Wine update error:', error);
      res.status(500).json({ error: "Failed to update wine" });
    }
  });

  app.delete("/api/wines/:id", async (req, res) => {
    try {
      await db.delete(wines).where(eq(wines.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete wine" });
    }
  });

  // Reviews
  app.post("/api/reviews", async (req, res) => {
    try {
      const newReview = await db.insert(reviews).values(req.body).returning();
      res.json(newReview[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const [vintageDistribution, regionDistribution] = await Promise.all([
        db
          .select({
            vintage: wines.vintage,
            count: sql`count(${wines.id})`,
          })
          .from(wines)
          .groupBy(wines.vintage)
          .orderBy(wines.vintage),
        db
          .select({
            region: wines.region,
            count: sql`count(${wines.id})`,
          })
          .from(wines)
          .groupBy(wines.region)
          .orderBy(wines.region),
      ]);

      res.json({
        vintageDistribution,
        regionDistribution,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
}