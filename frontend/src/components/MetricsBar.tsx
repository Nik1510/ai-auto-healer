import React from 'react';

export const MetricsBar = ({ totalIncidents, openCritical, logsPerSec, healthyServicesCount }: { totalIncidents: number, openCritical: number, logsPerSec: number, healthyServicesCount: number }) => {
  return (
    <div className="w-full border-b border-neutral-800 bg-[#000000]">
      <table className="w-full text-left font-mono text-xs uppercase tracking-widest text-neutral-400">
        <tbody>
          <tr className="border-b border-neutral-800 divide-x divide-neutral-800">
            <td className="p-4 w-1/4 align-top">
              <div className="mb-2">HEALTHY SERVICES</div>
              <div className="text-2xl font-bold text-white tracking-tighter">{healthyServicesCount}/12</div>
            </td>
            <td className="p-4 w-1/4 align-top">
              <div className="mb-2">TOTAL INCIDENTS</div>
              <div className="text-2xl font-bold text-white tracking-tighter">{totalIncidents}</div>
            </td>
            <td className="p-4 w-1/4 align-top">
              <div className="mb-2">OPEN CRITICAL</div>
              <div className="text-2xl font-bold text-white tracking-tighter">{openCritical}</div>
            </td>
            <td className="p-4 w-1/4 align-top">
              <div className="mb-2">LOG STREAM</div>
              <div className="text-2xl font-bold text-white tracking-tighter">{logsPerSec}/s</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
