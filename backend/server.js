const app = require('./src/app');
const sequelize = require('./src/config/database');
const { User, KategoriGangguan } = require('./src/models');

const PORT = process.env.PORT || 5000;

// Sync database and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database Railway connected successfully');

    // Sync models (set alter: false in production)
    await sequelize.sync({ alter: false });
    console.log('✅ Models synchronized');

    // await initAdminUser(); // Commented because admin already exists in DB

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}/api`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log('\n📋 Available Endpoints:');
      console.log('   POST   /api/auth/login');
      console.log('   GET    /api/auth/me');
      console.log('   PUT    /api/auth/profile');
      console.log('   PUT    /api/auth/password');
      console.log('   GET    /api/users');
      console.log('   POST   /api/users');
      console.log('   PUT    /api/users/:id');
      console.log('   DELETE /api/users/:id');
      console.log('   GET    /api/dashboard/stats');
      console.log('   GET    /api/laporan');
      console.log('   PUT    /api/laporan/:id/status');
      console.log('   GET    /api/tugas');
      console.log('   POST   /api/tugas');
      console.log('   GET    /api/reset-password');
      console.log('   PUT    /api/reset-password/:id/approve');
      console.log('   PUT    /api/reset-password/:id/reject');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
