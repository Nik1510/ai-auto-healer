import React from 'react';
import { Server, AlertOctagon, Activity, Zap } from 'lucide-react';

export const MetricsBar = ({ totalIncidents, openCritical, logsPerSec }: { totalIncidents: number, openCritical: number, logsPerSec: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <MetricCard title="Healthy Services" value="12/12" icon={<Server className="w-5 h-5 text-emerald-400" />} />
      <MetricCard title="Total Incidents" value={totalIncidents.toString()} icon={<Activity className="w-5 h-5 text-blue-400" />} />
      <MetricCard title="Open Critical" value={openCritical.toString()} icon={<AlertOctagon className="w-5 h-5 text-red-400" />} />
      <MetricCard title="Log Stream" value={`${logsPerSec}/s`} icon={<Zap className="w-5 h-5 text-yellow-400" />} />
    </div>
  );
};

const MetricCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
  <div className="glass-panel p-5 flex items-center gap-4">
    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-white/50">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  </div>
);
