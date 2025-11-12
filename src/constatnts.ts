import path from "path";

export const MAX_VIDEO_SIZE = 1024 * 1024 * 100;
export const MAX_IMAGE_SIZE = 1024 * 1024 * 5;
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const ACCEPTED_IMAGE_TYPES = ['image/jpg', 'image/png', 'image/jpeg'];

export const MIN_DURATION_MS = 10000;
export const MAX_DURATION_MS = 30000;

export const ADS_PAGE_SIZE = "12";

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");