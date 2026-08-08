import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import prisma from './utils/prisma';
import { initSocket } from './websocket/socket';
import logsRouter from './api/logs';
import incidentsRouter from './api/incidents';
import fixRouter from './api/fix';
import githubRouter from './api/github';
import './workers/incidentWorker'; // Initialize worker
import { startTelemetry } from './utils/demo-log-generator';

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'AI Auto Healer API' });
});

app.use('/api/log', logsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/fix', fixRouter);
app.use('/api/github', githubRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const startServer = async () => {
  console.log('--- STARTING AI AUTO HEALER BACKEND ---');

  const PORT = process.env.PORT || 5000;

  // Environment Validation
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  WARNING: DATABASE_URL is not set. Database operations will fail.');
  } else {
    console.log('✅ DATABASE_URL is present.');
  }

  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    console.warn('⚠️  WARNING: Neither REDIS_URL nor REDIS_HOST are set. Background queues may fail.');
  } else {
    console.log('✅ Redis configuration detected.');
  }

  // Test Database Connection Gracefully
  try {
    await prisma.$connect();
    console.log('✅ Prisma successfully connected to PostgreSQL.');
  } catch (dbError) {
    console.error('❌ Prisma failed to connect to PostgreSQL on startup:', dbError);
    console.warn('⚠️  Continuing boot sequence, but expect database queries to fail...');
  }

  // Start HTTP Server explicitly on 0.0.0.0
  httpServer.listen(PORT as number, '0.0.0.0', () => {
    console.log(`🚀 Server successfully bound to 0.0.0.0 and listening on port ${PORT}`);
    startTelemetry();
  });
};

startServer().catch(err => {
  console.error('❌ Fatal error during server startup:', err);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  httpServer.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
