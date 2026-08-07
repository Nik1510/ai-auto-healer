const http = require('http');

async function fetchJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runTests() {
  const results = [];
  console.log("Starting E2E Tests...\n");

  // 1. API & Health Check
  try {
    const r1 = await fetchJson('http://localhost:5000/');
    if (r1.status === 200 && r1.body.status === 'ok') {
      results.push({ name: '1. API & Health Check', status: 'PASS' });
    } else {
      results.push({ name: '1. API & Health Check', status: 'FAIL', error: r1.body });
    }
  } catch (e) {
    results.push({ name: '1. API & Health Check', status: 'FAIL', error: e.message });
  }

  // 2. Ingestion & WebSocket Stream Test (Mocking WS, just checking ingestion HTTP)
  try {
    const r2 = await fetchJson('http://localhost:5000/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: 'auth', level: 'INFO', message: 'E2E Test: User login successful' })
    });
    if (r2.status === 201 && r2.body.log) {
      results.push({ name: '2. Ingestion & WebSocket Stream Test', status: 'PASS' });
    } else {
      results.push({ name: '2. Ingestion & WebSocket Stream Test', status: 'FAIL', error: r2.body });
    }
  } catch (e) {
    results.push({ name: '2. Ingestion & WebSocket Stream Test', status: 'FAIL', error: e.message });
  }

  // 3. Incident Creation & BullMQ Queue Test
  let incidentId = null;
  try {
    const r3 = await fetchJson('http://localhost:5000/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service: 'database', level: 'ERROR', message: 'E2E Test: Database connection pool exhausted' })
    });
    if (r3.status === 201 && r3.body.incident && r3.body.incident.status === 'OPEN') {
      incidentId = r3.body.incident.id;
      results.push({ name: '3. Incident Creation & BullMQ Queue Test', status: 'PASS' });
    } else {
      results.push({ name: '3. Incident Creation & BullMQ Queue Test', status: 'FAIL', error: r3.body });
    }
  } catch (e) {
    results.push({ name: '3. Incident Creation & BullMQ Queue Test', status: 'FAIL', error: e.message });
  }

  // 4. AI Processing & Storage Test
  try {
    if (!incidentId) throw new Error('No incident ID from previous step');
    let inc = null;
    console.log('Polling for AI processing (up to 15s)...');
    for (let attempt = 0; attempt < 8; attempt++) {
      const r4 = await fetchJson('http://localhost:5000/api/incidents');
      inc = r4.body.find(i => i.id === incidentId);
      if (inc && inc.aiAnalysis && inc.aiAnalysis.rootCause) {
        break;
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    
    if (inc && inc.aiAnalysis && inc.aiAnalysis.rootCause) {
      results.push({ name: '4. AI Processing & Storage Test', status: 'PASS' });
    } else {
      results.push({ name: '4. AI Processing & Storage Test', status: 'FAIL', error: 'AI analysis not found or not processed in time' });
    }
  } catch (e) {
    results.push({ name: '4. AI Processing & Storage Test', status: 'FAIL', error: e.message });
  }

  // 5. Fix Script Generation Endpoint Test
  try {
    if (!incidentId) throw new Error('No incident ID');
    const r5 = await fetchJson(`http://localhost:5000/api/fix/${incidentId}`, { method: 'POST' });
    if (r5.status === 200 && r5.body.script && r5.body.script.includes('#!/bin/bash')) {
      results.push({ name: '5. Fix Script Generation Endpoint Test', status: 'PASS' });
    } else {
      results.push({ name: '5. Fix Script Generation Endpoint Test', status: 'FAIL', error: r5.body });
    }
  } catch (e) {
    results.push({ name: '5. Fix Script Generation Endpoint Test', status: 'FAIL', error: e.message });
  }

  // 6. GitHub Draft PR Integration Test
  try {
    if (!incidentId) throw new Error('No incident ID');
    const r6 = await fetchJson(`http://localhost:5000/api/github/pr/${incidentId}`, { method: 'POST' });
    if (r6.status === 200 && r6.body.success && r6.body.prUrl) {
      results.push({ name: '6. GitHub Draft PR Integration Test', status: 'PASS' });
    } else {
      results.push({ name: '6. GitHub Draft PR Integration Test', status: 'FAIL', error: r6.body });
    }
  } catch (e) {
    results.push({ name: '6. GitHub Draft PR Integration Test', status: 'FAIL', error: e.message });
  }

  console.log("=== TEST SUMMARY ===");
  results.forEach(r => {
    console.log(`[${r.status}] ${r.name}`);
    if (r.error) console.log(`       Error:`, r.error);
  });
}

runTests();
