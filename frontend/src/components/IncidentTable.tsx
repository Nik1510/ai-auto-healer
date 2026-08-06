import React from 'react';
import { motion } from 'framer-motion';

export const IncidentTable = ({ incidents, onView }: { incidents: any[], onView: (inc: any) => void }) => {
  const getSeverityColor = (sev: string) => {
    if (sev === 'CRITICAL') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (sev === 'ERROR') return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    if (sev === 'WARNING') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  const getStatusColor = (status: string) => {
    if (status === 'RESOLVED') return 'text-green-400';
    if (status === 'INVESTIGATING') return 'text-purple-400';
    return 'text-red-400';
  };

  return (
    <div className="glass-panel flex flex-col h-[500px]">
      <div className="p-4 border-b border-white/10 bg-black/20 rounded-t-xl">
        <h2 className="text-sm font-medium text-white/80">Active Incidents</h2>
      </div>
      <div className="flex-1 overflow-y-auto terminal-scroll p-2">
        <table className="w-full text-left text-sm">
          <thead className="text-white/50 text-xs uppercase bg-black/20">
            <tr>
              <th className="px-4 py-3 rounded-tl-lg">Service</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Root Cause</th>
              <th className="px-4 py-3 rounded-tr-lg">Action</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-white/30 italic">No incidents reported</td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={inc.id} 
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{inc.service}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${getSeverityColor(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-medium text-xs uppercase ${getStatusColor(inc.status)}`}>
                    {inc.status}
                  </td>
                  <td className="px-4 py-3 text-white/70 max-w-[200px] truncate">
                    {inc.rootCause || 'Analyzing...'}
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => onView(inc)}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
