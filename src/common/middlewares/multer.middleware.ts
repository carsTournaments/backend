import multer from 'multer';

export const uploadMiddleware = multer({
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
