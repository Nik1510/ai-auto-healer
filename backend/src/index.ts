import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { initSocket } from './websocket/socket';
import logsRouter from './api/logs';
import incidentsRouter from './api/incidents';
import fixRouter from './api/fix';
import githubRouter from './api/github';
import './workers/incidentWorker'; // Initialize worker

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'AI Auto Healer API' });
});

app.use('/api/log', logsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/fix', fixRouter);
app.use('/api/github', githubRouter);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
