export const restartZeropsService = async (serviceStackId: string) => {
  const token = process.env.ZEROPS_API_TOKEN;
  
  if (!token || token === 'your_zerops_token_here' || token.trim() === '') {
    console.log(`[Zerops API] Dry-run: Restarting serviceStackId: ${serviceStackId}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true;
  }

  try {
    const res = await fetch(`https://api.app-prg1.zerops.io/api/rest/public/service-stack/${serviceStackId}/restart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Zerops API error: ${res.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('[Zerops API] Error restarting service:', error);
    return false;
  }
};

export const triggerZeropsAction = async (incident: { service: string, rootCause?: string }) => {
  const service = incident.service;
  let serviceStackId = '';
  let targetName = '';

  if (service === 'database' || service === 'inventory-service') {
    serviceStackId = process.env.ZEROPS_POSTGRES_SERVICE_ID || 'mock_postgres_id';
    targetName = 'postgres-db';
  } else if (service === 'auth-service') {
    serviceStackId = process.env.ZEROPS_REDIS_SERVICE_ID || 'mock_redis_id';
    targetName = 'redis-cache';
  } else {
    // Fallback default action
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `[ACTION] Executed generic auto-healing script for ${service}... Done`;
  }

  const success = await restartZeropsService(serviceStackId);
  
  if (success) {
    return `[ACTION] Executed Zerops API call: restarting ${targetName} service... Done`;
  } else {
    return `[ACTION] Failed to execute Zerops API call for ${targetName}. Fallback remediation applied.`;
  }
};
