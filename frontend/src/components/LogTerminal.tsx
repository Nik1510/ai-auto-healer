"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Pause, Play, Trash2 } from 'lucide-react';

export const LogTerminal = ({ logs, onClear }: { logs: any[], onClear?: () => void }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [displayedLogs, setDisplayedLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!isPaused) {
      setDisplayedLogs(logs);
    }
  }, [logs, isPaused]);

  useEffect(() => {
    const container = containerRef.current;
    if (container && !isPaused) {
      // Check if user is scrolled near the bottom (within 100px)
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      // Also scroll down if there is no scrollbar yet
      if (isNearBottom || container.scrollHeight <= container.clientHeight) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [displayedLogs, isPaused]);

  const safeDisplayedLogs = Array.isArray(displayedLogs) ? displayedLogs : [];
  const filteredLogs = safeDisplayedLogs.filter(log => {
    if (filter === 'ALL') return true;
    if (filter === 'ERRORS') return log.level === 'ERROR';
    if (filter === 'REMEDIATIONS') return log.level === 'ACTION';
    return true;
  });

  const getBadgeStyle = (level: string) => {
    if (level === 'ERROR') return 'text-rose-400 bg-rose-500/10';
    if (level === 'WARNING') return 'text-amber-400 bg-amber-500/10';
    if (level === 'ACTION') return 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30';
    return 'text-sky-400 bg-sky-500/10';
  };

  return (
    <div className="bg-[#000000] flex flex-col h-full w-full">
      <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#000000]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-medium text-slate-300">Live Log Stream</h2>
          </div>
          <div className="flex gap-2">
            {['ALL', 'ERRORS', 'REMEDIATIONS'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`text-xs font-mono uppercase tracking-widest transition-colors ${filter === f ? 'text-white font-bold' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                [ {f} ]
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-colors ${isPaused ? 'text-amber-500' : 'text-neutral-500 hover:text-white'}`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            [ {isPaused ? 'RESUME' : 'PAUSE'} ]
          </button>
          <button 
            onClick={() => {
              if (onClear) onClear();
              setDisplayedLogs([]);
            }}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            [ CLEAR ]
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto terminal-scroll font-mono text-xs bg-[#000000]">
        {filteredLogs.length === 0 ? (
          <div className="text-neutral-500 italic p-4">No logs available...</div>
        ) : (
          filteredLogs.map((log, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={i} 
              className="flex gap-4 hover:bg-neutral-900 px-4 py-2 border-b border-neutral-900 transition-colors"
            >
              <span className="text-neutral-600 shrink-0 select-none w-8 text-right">
                {i + 1}
              </span>
              <span className="text-neutral-500 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={`shrink-0 font-mono tracking-widest uppercase w-16 ${
                log.level === 'ERROR' ? 'text-red-500' : log.level === 'ACTION' ? 'text-emerald-500' : 'text-neutral-400'
              }`}>
                [{log.level}]
              </span>
              <span className="text-neutral-400 shrink-0 font-medium">
                {log.service}
              </span>
              <span className={`break-words ${log.level === 'ACTION' ? 'text-emerald-500' : log.level === 'ERROR' ? 'text-red-500' : 'text-neutral-300'}`}>
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
