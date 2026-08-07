import React, { useState } from 'react';
import { Activity, ShieldAlert, Wifi, WifiOff, Zap } from 'lucide-react';

const SCENARIOS = [
  { service: 'inventory-service', message: 'Database connection timeout', label: 'PostgreSQL Pool Exhaustion' },
  { service: 'auth-service', message: 'Redis Sentinel connection failure', label: 'Redis Sentinel Failure' },
  { service: 'auth-service', message: 'JWT signature verification failed for token', label: 'JWT Key Rotation Mismatch' },
  { service: 'payment-gateway', message: 'Rate limit exceeded for upstream provider Stripe', label: 'Payment Rate Limit Exceeded' }
];

export const Header = ({ isConnected, isAutonomous, setAutonomous }: { isConnected: boolean, isAutonomous: boolean, setAutonomous: (val: boolean) => void }) => {
  const [selectedScenario, setSelectedScenario] = useState(0);

  const simulateError = async () => {
    try {
      const scenario = SCENARIOS[selectedScenario];
      await fetch('http://localhost:5000/api/log/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: scenario.service,
          message: scenario.message,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b border-neutral-800 gap-4 w-full bg-[#000000]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-none">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-100">Aura SRE / Production Dashboard</h1>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
          <span className="px-2 py-1 border border-neutral-800 rounded-none bg-[#050505]">[ CLUSTER: ZEROPS-PRD-01 ]</span>
          <span className="px-2 py-1 border border-neutral-800 rounded-none bg-[#050505]">[ LATENCY: 12MS ]</span>
          <span className="px-2 py-1 border border-neutral-800 rounded-none bg-[#050505] text-white flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white"></span>
            MODE: {isAutonomous ? 'AUTONOMOUS' : 'MANUAL'}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        {/* Autonomous Mode Toggle */}
          <label className={`flex items-center gap-2 cursor-pointer border border-neutral-800 px-3 py-1.5 rounded-none text-xs font-mono uppercase tracking-widest text-neutral-400 transition-colors ${isAutonomous ? 'bg-white text-black border-white' : 'bg-[#050505] hover:bg-neutral-900'}`}>
          <Zap className={`w-3 h-3 ${isAutonomous ? 'text-black fill-black' : 'text-neutral-500'}`} />
          <span>Auto-Healer</span>
          <div className="relative ml-2">
            <input type="checkbox" className="sr-only" checked={isAutonomous} onChange={(e) => setAutonomous(e.target.checked)} />
            <div className={`block w-6 h-3 transition-colors ${isAutonomous ? 'bg-black border border-black' : 'bg-neutral-800'}`}></div>
            <div className={`dot absolute left-0 top-0 bg-white w-3 h-3 transition-transform ${isAutonomous ? 'transform translate-x-3 bg-white' : 'bg-neutral-500'}`}></div>
          </div>
        </label>

        {/* Chaos Engineering Dropdown & Button */}
        <div className="flex items-center gap-2 border border-neutral-800 rounded-none bg-[#050505]">
          <select 
            className="bg-transparent text-neutral-300 text-xs font-mono uppercase tracking-widest outline-none px-3 py-2 cursor-pointer"
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(Number(e.target.value))}
          >
            {SCENARIOS.map((s, idx) => (
              <option key={idx} value={idx} className="bg-black">{s.label}</option>
            ))}
          </select>
          <button 
            onClick={simulateError}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-white hover:text-black text-neutral-300 transition-colors text-xs font-mono uppercase tracking-widest cursor-pointer whitespace-nowrap border-l border-neutral-800"
          >
            <ShieldAlert className="w-3 h-3" />
            FIRE
          </button>
        </div>
        
        {/* Status */}
        <div className={`flex items-center gap-2 px-3 py-2 border rounded-none text-[10px] font-mono tracking-widest uppercase ${
          isConnected ? 'bg-[#050505] border-neutral-800 text-neutral-300' : 'bg-red-600 text-white border-red-600'
        }`}>
          {isConnected ? (
            <div className="w-2 h-2 bg-white"></div>
          ) : <WifiOff className="w-3 h-3" />}
          {isConnected ? '[ CONNECTED ]' : '[ DISCONNECTED ]'}
        </div>
      </div>
    </header>
  );
};
