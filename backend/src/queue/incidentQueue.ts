import { Queue } from 'bullmq';
import { connection } from './redis';

export const incidentQueue = new Queue('incident-analysis', { connection });

export const addIncidentToQueue = async (incidentId: string, logData: any) => {
  await incidentQueue.add('analyze-incident', { incidentId, logData });
};
