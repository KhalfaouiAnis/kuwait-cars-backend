import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, file, cb) => {
    const dest = ["thumbnail", "image", "images"].includes(file.fieldname)
      ? path.join(uploadDir, "images")
      : path.join(uploadDir, "videos");

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (
      file.mimetype.startsWith("video/") ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export const uploadVideo = upload.single("video");
export const uploadImage = upload.single("image");
export const uploadMultiImage = upload.array("images", 10);

export const uploadAdFiles = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 10 },
  { name: "video", maxCount: 1 },
]);

export const handleUpload =
  (uploadHandler: any) => (req: Request, res: Response, next: NextFunction) => {
    uploadHandler(req, res, (err: any) => {
      if (err) {
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res
            .status(400)
            .json({ error: "Unexpected file field - check field names" });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  };
