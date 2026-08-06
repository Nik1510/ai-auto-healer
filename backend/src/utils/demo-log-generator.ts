const sendLog = async (service: string, level: string, message: string) => {
  try {
    const response = await fetch('http://localhost:5000/api/log', {
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

const runDemo = async () => {
  console.log('Starting demo log generator...');
  
  await sendLog('auth-service', 'INFO', 'User login successful');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await sendLog('payment-service', 'INFO', 'Processing payment');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  await sendLog('database', 'ERROR', 'Database connection timeout');
  await new Promise(resolve => setTimeout(resolve, 1000));

  await sendLog('redis', 'ERROR', 'Redis unavailable');
  
  console.log('Finished demo log generation.');
};

runDemo();
