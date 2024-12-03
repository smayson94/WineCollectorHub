import express, { type Express } from "express";
import { db } from "db";
import { bins, wines, reviews } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

export function registerRoutes(app: Express) {
  // File upload route
  app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Generate the URL for the uploaded file
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
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

  app.post("/api/wines", async (req, res) => {
    try {
      const newWine = await db.insert(wines).values(req.body).returning();
      res.json(newWine[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to create wine" });
    }
  });

  app.put("/api/wines/:id", async (req, res) => {
    try {
      const wine = await db.update(wines)
        .set(req.body)
        .where(eq(wines.id, parseInt(req.params.id)))
        .returning();
      res.json(wine[0]);
    } catch (error) {
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
