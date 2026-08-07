"use client";

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence mode="wait">
      {!isVisible ? (
        <motion.div 
          key="collapsed"
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          className="flex justify-end p-4 border-b border-neutral-800"
        >
          <button 
            onClick={() => setIsVisible(true)}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            [ SHOW HEADER ]
          </button>
        </motion.div>
      ) : (
        <motion.div 
          key="expanded"
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          exit={{ opacity: 0, height: 0 }}
          className="relative overflow-hidden border-b border-neutral-800"
        >
          <div className="absolute top-4 right-4">
            <button 
              onClick={() => setIsVisible(false)}
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
              [ HIDE ]
            </button>
          </div>

          <div className="flex flex-col md:flex-row p-4 md:p-12 items-start md:items-end gap-8">
            <h1 className="text-7xl md:text-[10vw] leading-none font-bold tracking-tighter text-white uppercase">
              AURA SRE
            </h1>
            <div className="flex flex-col gap-2 max-w-sm mb-4">
              <span className="text-sm font-mono tracking-widest text-neutral-400 uppercase">
                Autonomous Incident Remediation
              </span>
              <p className="text-neutral-500 text-xs font-mono">
                Streamlining MTTR from 30 minutes to 3 seconds through AI root-cause reasoning and automated Zerops API actions.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
