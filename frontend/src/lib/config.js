// src/lib/config.js
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, '../../../uploads');
export const PROCESSED_DIR = path.join(__dirname, '../../../processed');
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB