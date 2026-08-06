import { Worker, Job } from 'bullmq';
import { connection } from '../queue/redis';
import prisma from '../utils/prisma';
import { emitIncident } from '../websocket/socket';
import { analyzeIncidentLogs } from '../services/gemini/analyzer';

export const incidentWorker = new Worker(
  'incident-analysis',
  async (job: Job) => {
    const { incidentId } = job.data;
    console.log(`[Worker] Processing incident: ${incidentId}`);

    // Update status to INVESTIGATING immediately
    let incident = await prisma.incident.update({
      where: { id: incidentId },
      data: { status: 'INVESTIGATING' },
      include: { logs: true }
    });
    emitIncident(incident);

    // Call Gemini to analyze logs
    const analysis = await analyzeIncidentLogs(incident.logs);

    // Save the returned analysis to the AiAnalysis table
    const aiAnalysis = await prisma.aiAnalysis.create({
      data: {
        incidentId: incident.id,
        severity: analysis.severity,
        confidence: analysis.confidence,
        rootCause: analysis.rootCause,
        explanation: analysis.explanation,
        fix: analysis.fix,
        commands: analysis.commands,
        affectedService: analysis.affectedService
      }
    });

    // Update the Incident record
    incident = await prisma.incident.update({
      where: { id: incidentId },
      data: { 
        status: 'OPEN', // keep tracked status OPEN
        severity: analysis.severity,
        rootCause: analysis.rootCause
      },
      include: { logs: true, aiAnalysis: true }
    });

    // Broadcast updated incident and analysis
    emitIncident(incident);
    
    return { success: true, analysisId: aiAnalysis.id };
  },
  { connection }
);

incidentWorker.on('completed', (job: Job) => {
  console.log(`[Worker] Job completed for incident: ${job.data.incidentId}`);
});

incidentWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`[Worker] Job failed for incident: ${job?.data?.incidentId}`, err);
});
