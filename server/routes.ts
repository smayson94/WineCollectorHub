import fs from "fs";
import express, { type Express } from "express";
import { db } from "db";
import { bins, wines, reviews } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { upload, processImage } from "./upload";
import path from "path";

export function registerRoutes(app: Express) {
  // Add error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  // Test database connection
  app.get("/api/health", async (req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      res.json({ status: 'healthy', database: 'connected' });
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ status: 'unhealthy', error: 'Database connection failed' });
    }
  });

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
      console.error('Error fetching bins:', error);
      res.status(500).json({ error: "Failed to fetch bins" });
    }
  });

  app.post("/api/bins", async (req, res) => {
    try {
      const newBin = await db.insert(bins).values(req.body).returning();
      res.json(newBin[0]);
    } catch (error) {
      console.error('Error creating bin:', error);
      res.status(500).json({ error: "Failed to create bin" });
    }
  });

  // Wines
  app.get("/api/wines", async (req, res) => {
    try {
      // Join with reviews to get the latest ratings
      const allWines = await db
        .select({
          ...wines,
          reviews: sql`json_agg(${reviews})`
        })
        .from(wines)
        .leftJoin(reviews, eq(reviews.wineId, wines.id))
        .groupBy(wines.id)
        .orderBy(desc(wines.createdAt));

      res.json(allWines);
    } catch (error) {
      console.error('Error fetching wines:', error);
      res.status(500).json({ error: "Failed to fetch wines" });
    }
  });

  app.post("/api/wines", upload.single("image"), async (req, res) => {
    try {
      const wineData = typeof req.body.wine === 'string'
        ? JSON.parse(req.body.wine)
        : req.body.wine;

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
      console.error('Wine delete error:', error);
      res.status(500).json({ error: "Failed to delete wine" });
    }
  });

  // Reviews - with improved date handling
  app.post("/api/reviews", async (req, res) => {
    try {
      const { wineId, rating, notes, reviewDate } = req.body;
      console.log('Received review data:', { wineId, rating, notes, reviewDate });

      // Validate required fields
      if (!wineId || typeof rating !== 'number' || rating < 0 || rating > 100) {
        return res.status(400).json({
          error: "Invalid review data. WineId is required and rating must be between 0 and 100."
        });
      }

      // Validate reviewDate format
      let parsedDate: Date;
      try {
        parsedDate = reviewDate ? new Date(reviewDate) : new Date();
        if (isNaN(parsedDate.getTime())) {
          throw new Error('Invalid date');
        }
      } catch (error) {
        return res.status(400).json({
          error: "Invalid review date format. Please provide a valid ISO date string or leave empty for current date."
        });
      }

      // Ensure the wine exists before creating a review
      const wine = await db.select().from(wines).where(eq(wines.id, wineId));
      if (!wine || wine.length === 0) {
        return res.status(404).json({ error: "Wine not found" });
      }

      // Create the review with validated date
      const review = {
        wineId,
        rating,
        notes: notes || '',
        reviewDate: parsedDate
      };

      const newReview = await db.insert(reviews).values(review).returning();
      console.log('Review created successfully:', newReview[0]);
      res.json(newReview[0]);
    } catch (error) {
      console.error('Review creation error:', error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });
}