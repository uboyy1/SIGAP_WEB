const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;
const allowedMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const allowedFormats = ['jpg', 'jpeg', 'png', 'webp'];

const uploadFolders = {
  profil: 'sigap/profil',
  laporan: 'sigap/laporan',
  cover: 'sigap/cover',
  laporanDarurat: 'sigap/laporan-darurat'
};

const sanitizePublicIdPart = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9_-]/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '') || 'image';

const buildPublicId = (prefix, req, file) => {
  const userId = req.user?.id ? `user-${req.user.id}` : 'guest';
  const originalName = path.basename(file.originalname, path.extname(file.originalname));
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
  return `${prefix}-${sanitizePublicIdPart(userId)}-${uniqueSuffix}-${sanitizePublicIdPart(originalName)}`;
};

const createCloudinaryStorage = (folder, prefix) => new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder,
    allowed_formats: allowedFormats,
    public_id: buildPublicId(prefix, req, file),
    resource_type: 'image',
    transformation: [
      { width: 1600, height: 1600, crop: 'limit', quality: 'auto:good' }
    ]
  })
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
  return next();
};

const createUpload = (folder, prefix) => multer({
  storage: createCloudinaryStorage(folder, prefix),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter
});

const upload = createUpload(uploadFolders.profil, 'profil');
const uploadLaporan = createUpload(uploadFolders.laporan, 'laporan');
const uploadCover = createUpload(uploadFolders.cover, 'cover');
const uploadLaporanDarurat = createUpload(uploadFolders.laporanDarurat, 'laporan-darurat');

module.exports = upload;
module.exports.uploadLaporan = uploadLaporan;
module.exports.uploadCover = uploadCover;
module.exports.uploadLaporanDarurat = uploadLaporanDarurat;
module.exports.compressUploadedImage = compressUploadedImage;
