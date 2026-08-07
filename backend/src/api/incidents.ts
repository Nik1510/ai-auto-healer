import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        logs: true,
        aiAnalysis: true,
      },
    });
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        logs: true,
        aiAnalysis: true,
      },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

import { triggerZeropsAction } from '../services/zerops';

router.post('/:id/remediate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const incident = await prisma.incident.findUnique({ where: { id }, include: { aiAnalysis: true } });
    if (!incident) return res.status(404).json({ error: 'Incident not found' });
    if (incident.status === 'RESOLVED') return res.json({ success: true, incident });

    // Execute Zerops infrastructure action
    const actionMessage = await triggerZeropsAction(incident);

    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: { status: 'RESOLVED' },
      include: { logs: true, aiAnalysis: true }
    });

    // Create a resolution log
    const resolutionLog = await prisma.log.create({
      data: {
        service: incident.service,
        level: 'ACTION',
        message: actionMessage,
        incidentId: id
      }
    });

    const { emitIncident, emitLog } = require('../websocket/socket');
    emitLog(resolutionLog);
    emitIncident(updatedIncident);

    res.json({ success: true, incident: updatedIncident });
  } catch (error) {
    console.error('Error remediating incident:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
