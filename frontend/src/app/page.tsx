"use client";

import React, { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Header } from '@/components/Header';
import { MetricsBar } from '@/components/MetricsBar';
import { ServiceTopology } from '@/components/ServiceTopology';
import { LogTerminal } from '@/components/LogTerminal';
import { IncidentTable } from '@/components/IncidentTable';
import { IncidentModal } from '@/components/IncidentModal';
import { HeroSection } from '@/components/HeroSection';

export default function Dashboard() {
  const { socket, isConnected } = useSocket();
  const [logs, setLogs] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [isAutonomous, setIsAutonomous] = useState(false);

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

  // Autonomous Auto-Healer Hook
  useEffect(() => {
    if (!isAutonomous) return;
    
    // Find any critical incidents that have an AI analysis with confidence > 80 and are still OPEN
    const openCritical = incidents.filter(
      i => i.status === 'OPEN' && i.severity === 'CRITICAL' && i.aiAnalysis && i.aiAnalysis.confidence > 80
    );

    openCritical.forEach(async (incident) => {
      try {
        await fetch(`http://localhost:5000/api/incidents/${incident.id}/remediate`, { method: 'POST' });
      } catch (err) {
        console.error('Failed to auto-remediate:', err);
      }
    });
  }, [incidents, isAutonomous]);

  const openCriticalIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.severity === 'CRITICAL');
  const openCritical = openCriticalIncidents.length;
  const activeCriticalServicesCount = new Set(openCriticalIncidents.map(i => i.affectedService)).size;
  const healthyServicesCount = Math.max(0, 12 - activeCriticalServicesCount);

  // Dynamic logs per second based on recent logs (last 5 seconds)
  const now = new Date().getTime();
  const recentLogsCount = logs.filter(l => (now - new Date(l.timestamp).getTime()) < 5000).length;
  const logsPerSec = logs.length > 0 ? (recentLogsCount / 5).toFixed(1) : 0; 

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col">
      <div className="w-full flex-1 flex flex-col">
        <Header isConnected={isConnected} isAutonomous={isAutonomous} setAutonomous={setIsAutonomous} />
        
        <HeroSection />

        <MetricsBar 
          totalIncidents={incidents.length} 
          openCritical={openCritical}
          logsPerSec={Number(logsPerSec)}
          healthyServicesCount={healthyServicesCount}
        />

        <ServiceTopology incidents={incidents} />

        <div className="grid grid-cols-1 xl:grid-cols-2 flex-1 border-t border-neutral-800">
          <div className="border-r border-neutral-800">
            <LogTerminal logs={logs} onClear={() => setLogs([])} />
          </div>
          <div>
            <IncidentTable incidents={incidents} onView={setSelectedIncident} />
          </div>
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
