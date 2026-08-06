"use client";

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Header } from '@/components/Header';
import { MetricsBar } from '@/components/MetricsBar';
import { LogTerminal } from '@/components/LogTerminal';
import { IncidentTable } from '@/components/IncidentTable';
import { IncidentModal } from '@/components/IncidentModal';

export default function Dashboard() {
  const { socket, isConnected } = useSocket();
  const [logs, setLogs] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);

  // Initial fetch
  useEffect(() => {
    fetch('http://localhost:5000/api/incidents')
      .then(res => res.json())
      .then(data => setIncidents(data))
      .catch(err => console.error(err));
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('new-log', (log) => {
      setLogs(prev => [...prev, log].slice(-100)); // Keep last 100 logs
    });

    socket.on('new-incident', (incident) => {
      setIncidents(prev => {
        const exists = prev.find(i => i.id === incident.id);
        if (exists) {
          // Update existing
          const updated = prev.map(i => i.id === incident.id ? incident : i);
          // Update selected if open
          if (selectedIncident?.id === incident.id) {
            setSelectedIncident(incident);
          }
          return updated;
        }
        return [incident, ...prev];
      });
    });

    return () => {
      socket.off('new-log');
      socket.off('new-incident');
    };
  }, [socket, selectedIncident]);

  const openCritical = incidents.filter(i => i.status !== 'RESOLVED' && i.severity === 'CRITICAL').length;
  // Approximation of logs per second based on recent logs (simplified for MVP)
  const logsPerSec = logs.length > 0 ? 1.2 : 0; 

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <Header isConnected={isConnected} />
        
        <MetricsBar 
          totalIncidents={incidents.length} 
          openCritical={openCritical}
          logsPerSec={logsPerSec} 
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <LogTerminal logs={logs} />
          <IncidentTable incidents={incidents} onView={setSelectedIncident} />
        </div>
      </div>

      {selectedIncident && (
        <IncidentModal 
          incident={selectedIncident} 
          onClose={() => setSelectedIncident(null)} 
        />
      )}
    </div>
  );
}
