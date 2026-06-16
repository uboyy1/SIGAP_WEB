const getUploadedFileUrl = (file) => file?.secure_url || file?.path || file?.url || '';

const getUploadedFileName = (file) => {
  const identifier = file?.filename || file?.public_id || file?.originalname || '';
  return String(identifier).split('/').pop();
};

module.exports = {
  getUploadedFileName,
  getUploadedFileUrl
};
