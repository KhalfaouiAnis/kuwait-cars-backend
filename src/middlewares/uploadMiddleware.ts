import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, file, cb) => {
    const dest =
      file.fieldname === 'image'
        ? path.join(uploadDir, 'images')
        : path.join(uploadDir, 'videos');
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (_, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e5);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (_, file, cb) => {
    if (
      file.mimetype.startsWith('video/') ||
      file.mimetype.startsWith('image/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export const uploadVideo = upload.single('video');
export const uploadImage = upload.single('image');

export const handleUpload = (
  // eslint-disable-next-line
  uploadHandler: any,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    uploadHandler(req, res, (err: Error) => {
      if (err) return res.status(400).json(err.message);
      next();
    });
  };
};
