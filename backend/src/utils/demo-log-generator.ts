const sendLog = async (service: string, level: string, message: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:${process.env.PORT || 5000}/api/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ service, level, message }),
    });
    const data = await response.json();
    console.log(`Sent [${level}] from ${service}:`, data);
  } catch (error) {
    console.error('Failed to send log:', error);
  }
};

const randomErrors = [
  'Error: connect ETIMEDOUT to Redis cluster (Cluster failover failed)',
  'Error: Postgres connection pool exhausted (max connections 100)',
  'Error: JWT signature verification failed due to rotated keys',
  'Error: Stripe API rate limit exceeded (HTTP 429)',
  'Error: Garbage collection paused for > 5s (Heap OOM)'
];

let telemetryInterval: NodeJS.Timeout | null = null;

export const startTelemetry = () => {
  console.log('Starting continuous telemetry stream...');
  
  const services = ['auth-service', 'payment-service', 'gateway-service', 'inventory-service', 'database'];
  const messages = [
    'User login successful',
    'Processing payment',
    'Gateway routing request',
    'Inventory item retrieved',
    'Database query executed',
    'Session refreshed',
    'Cache hit'
  ];

  if (telemetryInterval) {
    clearInterval(telemetryInterval);
  }

  telemetryInterval = setInterval(async () => {
    const service = services[Math.floor(Math.random() * services.length)];
    
    // ~2.5% chance to trigger an unannounced random incident
    const isError = Math.random() < 0.025;

    if (isError) {
      const errorMsg = randomErrors[Math.floor(Math.random() * randomErrors.length)];
      await sendLog(service, 'ERROR', errorMsg);
    } else {
      const message = messages[Math.floor(Math.random() * messages.length)];
      await sendLog(service, 'INFO', message);
    }
  }, 1500); // Every 1.5 seconds
};

export const stopTelemetry = () => {
  if (telemetryInterval) {
    clearInterval(telemetryInterval);
    telemetryInterval = null;
    console.log('Telemetry stream stopped.');
  }
};

// Removed standalone runDemo() execution so it can be imported
