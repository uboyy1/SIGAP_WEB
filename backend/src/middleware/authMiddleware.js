// Fungsi: Middleware backend untuk memproses request sebelum controller.
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Sesi habis, silakan login ulang'
        });
      }
      
      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({
        success: false,
        message: 'Sesi habis, silakan login ulang'
      });
    }
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Sesi habis, silakan login ulang'
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.is_admin === true)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang dapat mengakses.'
    });
  }
};

const kepalaTeknisiOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'kepala_teknisi' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya kepala teknisi yang dapat mengakses.'
    });
  }
};

module.exports = { protect, adminOnly, kepalaTeknisiOnly };
