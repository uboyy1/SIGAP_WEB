// Fungsi: Middleware backend untuk memproses request sebelum controller.
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(422).json({
    success: false,
    message: 'Data yang dikirim tidak valid',
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg
    }))
  });
};

module.exports = validateRequest;
