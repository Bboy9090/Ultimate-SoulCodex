🚀 Server Starting Up
NODE_ENV: ${process.env.NODE_ENV || 'development'}
PORT: ${PORT}
DATABASE_URL: ${process.env.DATABASE_URL ? '✓ Set' : '✗ Not set'}
Server listening on http://0.0.0.0:${PORT}
Health check: http://0.0.0.0:${PORT}/health
`);
      log(`Server ready on port ${PORT}`);
    }
  );
})();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Exit with failure code
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Exit with failure code
  process.exit(1);
});

// Handle SIGTERM gracefully (e.g., from Render shutdown)
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received: closing HTTP server gracefully');
  if (serverInstance) {
    // Set timeout for forced shutdown
    const forceCloseTimeout = setTimeout(() => {
      console.error('Forcing server close after timeout');
      process.exit(1);
    }, 10000);
    
    serverInstance.close(() => {
      console.info('HTTP server closed');
      clearTimeout(forceCloseTimeout);
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Handle SIGINT gracefully (e.g., Ctrl+C)
process.on('SIGINT', () => {
  console.info('SIGINT signal received: closing HTTP server gracefully');
  if (serverInstance) {
    // Set timeout for forced shutdown
    const forceCloseTimeout = setTimeout(() => {
      console.error('Forcing server close after timeout');
      process.exit(1);
    }, 10000);
    
    serverInstance.close(() => {
      console.info('HTTP server closed');
      clearTimeout(forceCloseTimeout);
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔥 Test route for the mobile app
app.get('/hello', (_req, res) => {
  res.json({ message: 'Soul Codex API is alive.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`SoulCodex API listening on http://localhost:${PORT}`);
});
