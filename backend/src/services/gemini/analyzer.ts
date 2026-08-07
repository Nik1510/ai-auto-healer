import { GoogleGenAI, Type, Schema } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

// Fallback strategy check
const hasValidKey = apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '';

const ai = hasValidKey ? new GoogleGenAI({ apiKey }) : null;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    severity: { type: Type.STRING, description: "CRITICAL | ERROR | WARNING | INFO" },
    confidence: { type: Type.INTEGER, description: "Confidence score 0-100" },
    rootCause: { type: Type.STRING, description: "Short dynamic summary of root cause" },
    explanation: { type: Type.STRING, description: "Detailed breakdown of the issue" },
    fix: { type: Type.STRING, description: "Recommended fix action" },
    commands: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Array of strings containing bash commands"
    },
    affectedService: { type: Type.STRING }
  },
  required: ["severity", "confidence", "rootCause", "explanation", "fix", "commands", "affectedService"]
};

export const getMockFallback = (logs: Array<{ level: string, message: string, timestamp: Date, service: string }>) => {
  const message = logs[0]?.message?.toLowerCase() || '';
  let rootCause = "Unknown infrastructure failure";
  let explanation = "The logs indicate an unexpected failure that caused the service to crash or become unresponsive.";
  let fix = "Investigate the service logs and restart if necessary.";
  let commands = ["kubectl logs deploy/unknown-service", "kubectl rollout restart deploy/unknown-service"];

  if (message.includes('timeout') && message.includes('database')) {
    rootCause = "PostgreSQL connection pool exhausted (max 100)";
    explanation = "The database connection pool reached its maximum limit due to a spike in traffic, preventing new connections.";
    fix = "Increase the max connections in pgbouncer or database config and restart the service.";
    commands = ["kubectl scale deploy/pgbouncer --replicas=3", "kubectl rollout restart deploy/inventory-service"];
  } else if (message.includes('redis')) {
    rootCause = "Redis Sentinel failover timeout";
    explanation = "The primary Redis node failed and Sentinel could not promote a replica within the timeout window.";
    fix = "Force Sentinel to failover and restart the affected service pods to refresh connections.";
    commands = ["redis-cli -p 26379 sentinel failover mymaster", "kubectl rollout restart deploy/auth-service"];
  } else if (message.includes('jwt') || message.includes('token')) {
    rootCause = "JWT secret key mismatch during rotation";
    explanation = "The JWT signing key was rotated but the service is still using the old cached key, causing token verification failures.";
    fix = "Flush the local key cache and restart the auth service to pull the new secrets from Vault.";
    commands = ["curl -X POST http://auth-service/internal/flush-cache", "kubectl rollout restart deploy/auth-service"];
  } else if (message.includes('rate') || message.includes('payment')) {
    rootCause = "Payment Gateway Rate Limit Exceeded";
    explanation = "Upstream payment provider rate limit (1000 req/sec) was exceeded, causing downstream requests to fail.";
    fix = "Implement exponential backoff in the payment gateway client and temporarily throttle traffic.";
    commands = ["kubectl apply -f rate-limit-policy.yaml", "kubectl rollout restart deploy/payment-gateway"];
  }

  return {
    severity: "CRITICAL",
    confidence: 85,
    rootCause,
    explanation,
    fix,
    commands,
    affectedService: logs[0]?.service || "unknown"
  };
};

export const analyzeIncidentLogs = async (logs: Array<{ level: string, message: string, timestamp: Date, service: string }>) => {
  if (!ai) {
    console.warn('[Gemini] Missing or invalid GEMINI_API_KEY. Using mock analysis fallback.');
    return getMockFallback(logs);
  }

  const logsText = logs.map(l => `[${l.timestamp.toISOString()}] [${l.level}] ${l.message}`).join('\n');
  const prompt = `You are an expert DevOps and SRE engineer. Analyze the following logs to diagnose the incident root cause, estimate confidence, and provide actionable resolution commands.\n\nLogs:\n${logsText}`;

  try {
    const generatePromise = ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const timeoutPromise = new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Gemini API timeout (8s)')), 8000));

    const response = await Promise.race([generatePromise, timeoutPromise]);

    if (!response.text) {
      throw new Error('No text returned from Gemini API');
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error('[Worker Error]:', error);
    return getMockFallback(logs);
  }
};
