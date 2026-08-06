import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';

const router = Router();

router.post('/:incidentId', async (req: Request, res: Response) => {
  try {
    const { incidentId } = req.params;

    const aiAnalysis = await prisma.aiAnalysis.findUnique({
      where: { incidentId }
    });

    if (!aiAnalysis) {
      return res.status(404).json({ error: 'AI Analysis not found for this incident' });
    }

    const scriptContent = `#!/bin/bash
# AI Auto Healer - Generated Fix Script
# Incident ID: ${incidentId}
# Root Cause: ${aiAnalysis.rootCause}

echo "Applying automated fix..."
${aiAnalysis.commands.join('\n')}
echo "Fix applied successfully."
`;

    res.json({ script: scriptContent, filename: `fix-${incidentId}.sh` });
  } catch (error) {
    console.error('Error generating fix script:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
