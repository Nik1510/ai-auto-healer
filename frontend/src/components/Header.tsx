import React from 'react';
import { Activity, ShieldAlert, Wifi, WifiOff } from 'lucide-react';

export const Header = ({ isConnected }: { isConnected: boolean }) => {
  const simulateError = async () => {
    try {
      await fetch('http://localhost:5000/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'payment-gateway',
          level: 'ERROR',
          message: 'Connection timeout to payment provider Stripe',
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="flex items-center justify-between p-4 glass-panel mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Activity className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">AI Auto Healer</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={simulateError}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors text-sm font-medium cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          Simulate Incident
        </button>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
          isConnected ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </header>
  );
};
