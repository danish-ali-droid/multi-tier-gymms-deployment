import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from './errorHandler';

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
['profiles', 'trainers', 'banners'].forEach((sub) => {
  const dir = path.join(uploadDir, sub);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Multer disk storage configuration
 */
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const routePath = req.path || '';
    let subDir = 'profiles';
    if (routePath.includes('trainer')) subDir = 'trainers';
    else if (routePath.includes('banner')) subDir = 'banners';
    cb(null, path.join(uploadDir, subDir));
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

/**
 * File type filter — allow only images
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG, WebP, GIF) are allowed.', 400));
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize },
});

/**
 * Storage service abstraction — switch between local, S3, Cloudinary
 */
export const getFileUrl = (filename: string, subDir: string = 'profiles'): string => {
  const provider = process.env.STORAGE_PROVIDER || 'local';
  const port = process.env.PORT || 5000;
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

  if (provider === 's3') {
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${subDir}/${filename}`;
  }

  if (provider === 'cloudinary') {
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${subDir}/${filename}`;
  }

  // Local storage
  return `${baseUrl}/uploads/${subDir}/${filename}`;
};
