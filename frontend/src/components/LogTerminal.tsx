import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

export const LogTerminal = ({ logs }: { logs: any[] }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getColor = (level: string) => {
    if (level === 'ERROR') return 'text-red-400';
    if (level === 'WARNING') return 'text-yellow-400';
    return 'text-blue-400';
  };

  return (
    <div className="glass-panel flex flex-col h-[500px]">
      <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-black/20 rounded-t-xl">
        <Terminal className="w-4 h-4 text-white/50" />
        <h2 className="text-sm font-medium text-white/80">Live Log Stream</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto terminal-scroll font-mono text-xs space-y-1 bg-black/40 rounded-b-xl">
        {logs.length === 0 ? (
          <div className="text-white/30 italic">Waiting for logs...</div>
        ) : (
          logs.map((log, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={i} 
              className="flex gap-3 hover:bg-white/5 px-2 py-1 rounded"
            >
              <span className="text-white/30 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={`shrink-0 font-bold w-16 ${getColor(log.level)}`}>
                [{log.level}]
              </span>
              <span className="text-white/40 shrink-0">
                {log.service}
              </span>
              <span className="text-white/80 break-words">
                {log.message}
              </span>
            </motion.div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
