const config = require('./config');
const app = require('./app');
const prisma = require('./utils/prisma');

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`\n🚀 Finance Dashboard API`);
      console.log(`   Environment : ${config.env}`);
      console.log(`   Server      : http://localhost:${config.port}`);
      console.log(`   API Docs    : http://localhost:${config.port}/api-docs`);
      console.log(`   Health      : http://localhost:${config.port}/api/health`);
      console.log(`\n📋 Available endpoints:`);
      console.log(`   POST   /api/auth/register`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   GET    /api/auth/me`);
      console.log(`   GET    /api/users`);
      console.log(`   GET    /api/users/:id`);
      console.log(`   PATCH  /api/users/:id`);
      console.log(`   DELETE /api/users/:id`);
      console.log(`   POST   /api/records`);
      console.log(`   GET    /api/records`);
      console.log(`   GET    /api/records/:id`);
      console.log(`   PATCH  /api/records/:id`);
      console.log(`   DELETE /api/records/:id`);
      console.log(`   GET    /api/dashboard/summary`);
      console.log(`   GET    /api/dashboard/category-summary`);
      console.log(`   GET    /api/dashboard/trends`);
      console.log(`   GET    /api/dashboard/recent-activity`);
      console.log('');
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
