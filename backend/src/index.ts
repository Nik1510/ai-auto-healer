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

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  startTelemetry();
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
