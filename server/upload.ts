import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Configure multer upload
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and WebP are allowed."));
    }
  },
});

// Process uploaded image
export async function processImage(file: Express.Multer.File) {
  const thumbnail = `thumb_${file.filename}`;
  const thumbnailPath = path.join(uploadsDir, thumbnail);

  await sharp(file.path)
    .resize(200, 200, { fit: "cover" })
    .toFile(thumbnailPath);

  return {
    imageUrl: `/uploads/${file.filename}`,
    thumbnailUrl: `/uploads/${thumbnail}`,
  };
}
