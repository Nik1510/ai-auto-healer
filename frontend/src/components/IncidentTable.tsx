"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const IncidentTable = ({ incidents, onView }: { incidents: any[], onView: (inc: any) => void }) => {
  const safeIncidents = Array.isArray(incidents) ? incidents : [];
  const getSeverityColor = (sev: string) => {
    if (sev === 'CRITICAL') return 'bg-red-600 text-white border-red-600';
    if (sev === 'ERROR') return 'bg-orange-600 text-white border-orange-600';
    if (sev === 'WARNING') return 'bg-amber-500 text-black border-amber-500';
    return 'bg-blue-600 text-white border-blue-600';
  };

  const getStatusColor = (status: string) => {
    if (status === 'RESOLVED') return 'text-emerald-500';
    if (status === 'HEALING...') return 'text-amber-500 bg-amber-500/10 animate-pulse';
    if (status === 'INVESTIGATING') return 'text-purple-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-[#000000] flex flex-col h-full w-full">
      <div className="p-4 border-b border-neutral-800 bg-[#000000]">
        <h2 className="text-xs font-mono tracking-widest text-neutral-500 uppercase">[ ACTIVE INCIDENTS ]</h2>
      </div>
      <div className="flex-1 overflow-y-auto terminal-scroll">
        <table className="w-full text-left text-sm font-mono">
          <thead className="text-neutral-500 text-xs tracking-widest uppercase border-b border-neutral-800">
            <tr>
              <th className="px-4 py-3 font-normal">SERVICE</th>
              <th className="px-4 py-3 font-normal">SEVERITY</th>
              <th className="px-4 py-3 font-normal">STATUS</th>
              <th className="px-4 py-3 font-normal">ROOT CAUSE</th>
              <th className="px-4 py-3 font-normal text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {safeIncidents.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500 italic">No incidents reported</td>
              </tr>
            ) : (
              <AnimatePresence>
                {safeIncidents.map((inc) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={inc.id} 
                    className="border-b border-neutral-900 hover:bg-neutral-900 transition-colors group cursor-pointer"
                    onClick={() => onView(inc)}
                  >
                    <td className="px-4 py-4 text-white">{inc.service}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-widest border ${getSeverityColor(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className={`px-4 py-4 text-xs tracking-widest uppercase ${getStatusColor(inc.status)}`}>
                      {inc.status}
                    </td>
                    <td className="px-4 py-4 text-neutral-400 max-w-[200px] truncate text-xs">
                      {inc.rootCause || 'ANALYZING...'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-neutral-600 group-hover:text-white transition-colors uppercase tracking-widest text-xs">
                        [ VIEW ]
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
