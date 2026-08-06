import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { createFixPullRequest } from '../services/github/prService';

const router = Router();

router.post('/pr/:incidentId', async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params;

    const aiAnalysis = await prisma.aiAnalysis.findUnique({
      where: { incidentId }
    });

    if (!aiAnalysis) {
      return res.status(404).json({ error: 'AI Analysis not found for this incident' });
    }

    const prResult = await createFixPullRequest(incidentId, aiAnalysis);

    res.json(prResult);
  } catch (error) {
    console.error('Error creating GitHub PR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
