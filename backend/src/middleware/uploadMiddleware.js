// Fungsi: Middleware upload gambar untuk profil dan laporan.
// backend/src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const allowedMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/temp/');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const userId = req.user?.id || 'user';
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile_${userId}_${uniqueSuffix}${ext}`);
  }
});

const laporanStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/laporan/');
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `laporan_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const hasAllowedExtension = allowedExtensions.has(path.extname(file.originalname).toLowerCase());
  const hasAllowedMimeType = allowedMimeTypes.has(file.mimetype);

  if (hasAllowedExtension && hasAllowedMimeType) {
    cb(null, true);
    return;
  }

  cb(new Error('Hanya file gambar JPG, PNG, atau WEBP yang diperbolehkan.'), false);
};

const compressUploadedImage = async (req, res, next) => {
  if (!req.file?.path) return next();

  const compressedPath = `${req.file.path}.compressed`;

  try {
    let pipeline = sharp(req.file.path)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true
      });

    if (req.file.mimetype === 'image/png') {
      pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
    } else if (req.file.mimetype === 'image/webp') {
      pipeline = pipeline.webp({ quality: 82 });
    } else {
      pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
    }

    await pipeline.toFile(compressedPath);
    await fs.promises.rename(compressedPath, req.file.path);
    const stats = await fs.promises.stat(req.file.path);
    req.file.size = stats.size;
    return next();
  } catch (error) {
    fs.promises.unlink(compressedPath).catch(() => {});
    return next(error);
  }
};

const upload = multer({
  storage: profileStorage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter
});

const uploadLaporan = multer({
  storage: laporanStorage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter
});

module.exports = upload;
module.exports.uploadLaporan = uploadLaporan;
module.exports.compressUploadedImage = compressUploadedImage;
