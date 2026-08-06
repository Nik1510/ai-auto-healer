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

export const analyzeIncidentLogs = async (logs: Array<{ level: string, message: string, timestamp: Date, service: string }>) => {
  if (!ai) {
    console.warn('[Gemini] Missing or invalid GEMINI_API_KEY. Using mock analysis fallback.');
    // Fallback mock strategy
    return {
      severity: "CRITICAL",
      confidence: 85,
      rootCause: "Mock simulated outage",
      explanation: "This is a mock explanation because the Gemini API key was missing. The logs indicate a failure.",
      fix: "Restart the mocked service",
      commands: ["echo 'Running mock fix...'", "systemctl restart mock-service"],
      affectedService: logs[0]?.service || "unknown"
    };
  }

  const logsText = logs.map(l => `[${l.timestamp.toISOString()}] [${l.level}] ${l.message}`).join('\n');
  const prompt = `You are an expert DevOps and SRE engineer. Analyze the following logs to diagnose the incident root cause, estimate confidence, and provide actionable resolution commands.\n\nLogs:\n${logsText}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    if (!response.text) {
      throw new Error('No text returned from Gemini API');
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error('[Gemini] Error analyzing logs:', error);
    throw error;
  }
};
