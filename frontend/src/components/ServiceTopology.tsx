"use client";

import React from 'react';
import { motion } from 'framer-motion';

const SERVICES = [
  { id: 'gateway-service', name: 'GATEWAY' },
  { id: 'auth-service', name: 'AUTH' },
  { id: 'payment-service', name: 'PAYMENT' },
  { id: 'inventory-service', name: 'INVENTORY' },
  { id: 'database', name: 'DATABASE' },
];

export const ServiceTopology = ({ incidents }: { incidents: any[] }) => {
  const safeIncidents = Array.isArray(incidents) ? incidents : [];
  const openIncidentServices = new Set(
    safeIncidents
      .filter(i => i.status !== 'RESOLVED' && i.severity === 'CRITICAL')
      .map(i => i.affectedService)
  );

  return (
    <div className="w-full border-b border-neutral-800 bg-[#000000] p-4 md:p-12 overflow-hidden flex flex-col relative min-h-[300px] justify-center">
      <div className="absolute top-4 left-4">
        <h2 className="text-xs font-mono text-neutral-500 uppercase tracking-widest">[ TOPOLOGY ]</h2>
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 w-full max-w-5xl mx-auto mt-8">
        {SERVICES.map((service, idx) => {
          const isFailing = openIncidentServices.has(service.id);
          
          return (
            <div key={service.id} className="relative flex items-center">
              {idx > 0 && (
                <div className="hidden md:block absolute right-full w-16 h-px bg-neutral-800" />
              )}
              
              <motion.div
                className={`flex flex-col items-center justify-center p-4 transition-colors duration-200 ${
                  isFailing 
                    ? 'bg-red-600 text-white' 
                    : 'bg-transparent text-neutral-300 border border-transparent hover:border-neutral-800'
                }`}
              >
                <span className="text-lg font-mono font-bold tracking-widest whitespace-nowrap">
                  {isFailing ? `! ${service.name} !` : `[ ${service.name} ]`}
                </span>
                {isFailing && (
                  <span className="text-[10px] font-mono uppercase tracking-widest mt-2 bg-black text-red-500 px-2 py-0.5">
                    CRITICAL FAILURE
                  </span>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
