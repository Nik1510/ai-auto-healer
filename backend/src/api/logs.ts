import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { emitLog, emitIncident } from '../websocket/socket';
import { addIncidentToQueue } from '../queue/incidentQueue';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { service, level, message } = req.body;

    if (!service || !level || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let incidentId: string | undefined = undefined;
    let incident = null;

    if (level === 'ERROR') {
      incident = await prisma.incident.create({
        data: {
          service,
          severity: 'ERROR',
          status: 'OPEN',
        },
      });
      incidentId = incident.id;
    }

    const log = await prisma.log.create({
      data: {
        service,
        level,
        message,
        incidentId,
      },
    });

    emitLog(log);

    if (incident) {
      await addIncidentToQueue(incident.id, log);
      emitIncident(incident);
    }

    res.status(201).json({ log, incident });
  } catch (error) {
    console.error('Error in log ingestion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/simulate', async (req: Request, res: Response) => {
  try {
    const { service, message } = req.body;

    if (!service || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate context logs
    const infoLog = await prisma.log.create({
      data: { service, level: 'INFO', message: 'Incoming request routed successfully' }
    });
    emitLog(infoLog);

    const warningLog = await prisma.log.create({
      data: { service, level: 'WARNING', message: 'Response time degradation detected' }
    });
    emitLog(warningLog);

    // Generate error log and incident
    const incident = await prisma.incident.create({
      data: { service, severity: 'ERROR', status: 'OPEN' }
    });
    
    const errorLog = await prisma.log.create({
      data: { service, level: 'ERROR', message, incidentId: incident.id }
    });
    emitLog(errorLog);
    
    await addIncidentToQueue(incident.id, errorLog);
    emitIncident(incident);

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error in log simulation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
