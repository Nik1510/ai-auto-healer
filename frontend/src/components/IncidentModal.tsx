"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, GitPullRequest, AlertTriangle, Zap, CheckCircle2, Copy, Check } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-1fd-5000.ny1.zerops.app';

export const IncidentModal = ({ incident, onClose }: { incident: any, onClose: () => void }) => {
  const [prLoading, setPrLoading] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [copiedBash, setCopiedBash] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!incident) return null;

  const handleDownload = async () => {
    try {
      const res = await fetch(`${API_URL}/api/fix/${incident.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.script) {
        const blob = new Blob([data.script], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        a.click();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePR = async () => {
    setPrLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/github/pr/${incident.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPrUrl(data.prUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPrLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full md:w-[600px] lg:w-[800px] bg-black border-l border-neutral-800 h-full overflow-y-auto terminal-scroll relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-black p-6 border-b border-neutral-800 flex justify-between items-start z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-1 bg-red-600 text-white border-red-600 rounded-none text-xs font-mono font-bold tracking-widest uppercase">
                  {incident.severity}
                </span>
                <h2 className="text-2xl font-bold text-white font-mono uppercase tracking-tighter">{incident.service}</h2>
              </div>
              <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest">INCIDENT ID: {incident.id}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(incident, null, 2));
                  setCopiedJson(true);
                  setTimeout(() => setCopiedJson(false), 2000);
                }} 
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 transition-colors"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                [ COPY JSON ]
              </button>
              <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer border border-transparent hover:border-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8 font-mono">
            {!incident.aiAnalysis ? (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-500 border border-neutral-800">
                <Zap className="w-8 h-8 mb-4 animate-pulse text-white" />
                <p className="uppercase tracking-widest text-xs">[ AI ANALYSIS IN PROGRESS ]</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-neutral-800 p-5">
                    <div className="flex items-center gap-2 mb-3 text-red-500">
                      <AlertTriangle className="w-4 h-4" />
                      <h3 className="text-xs uppercase tracking-widest">ROOT CAUSE ANALYSIS</h3>
                    </div>
                    <p className="text-base font-bold text-white mb-4 uppercase">{incident.aiAnalysis.rootCause}</p>
                    <p className="text-xs text-neutral-400 leading-relaxed uppercase">{incident.aiAnalysis.explanation}</p>
                  </div>
                  
                  <div className="border border-neutral-800 p-5 flex flex-col justify-center items-center text-center">
                    <h3 className="text-xs uppercase tracking-widest text-white mb-2">AI CONFIDENCE</h3>
                    <div className="text-6xl font-bold tracking-tighter text-white">
                      {incident.aiAnalysis.confidence}%
                    </div>
                  </div>
                </div>

                <div className="border border-neutral-800 p-5">
                  <div className="flex items-center gap-2 mb-3 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <h3 className="text-xs uppercase tracking-widest">RECOMMENDED FIX</h3>
                  </div>
                  <p className="text-xs text-neutral-300 mb-4 uppercase">{incident.aiAnalysis.fix}</p>
                  
                  <div className="border border-neutral-800 bg-black p-4 text-emerald-500 overflow-x-auto relative group">
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black">
                       <button 
                         onClick={() => {
                           const cmds = incident.aiAnalysis.commands.join('\n');
                           navigator.clipboard.writeText(cmds);
                           setCopiedBash(true);
                           setTimeout(() => setCopiedBash(false), 2000);
                         }}
                         className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-widest text-neutral-400 hover:text-white border border-neutral-800 bg-black transition-colors cursor-pointer"
                       >
                         {copiedBash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                         [ COPY SCRIPT ]
                       </button>
                    </div>
                    {incident.aiAnalysis.commands.map((cmd: string, idx: number) => (
                      <div key={idx} className="whitespace-pre"><span className="text-neutral-700 select-none mr-2">#</span>{cmd}</div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    {incident.status !== 'RESOLVED' && (
                      <button 
                        onClick={async () => {
                          const btn = document.getElementById(`heal-btn-${incident.id}`);
                          if (btn) btn.innerHTML = '[ EXECUTING... ]';
                          
                          await fetch(`${API_URL}/api/incidents/${incident.id}/remediate`, { method: 'POST' });
                          setTimeout(() => onClose(), 800);
                        }}
                        id={`heal-btn-${incident.id}`}
                        className="flex-1 flex justify-center items-center gap-2 px-5 py-3 bg-white text-black hover:bg-neutral-200 transition-colors uppercase tracking-widest text-xs font-bold border border-white"
                      >
                        <Zap className="w-4 h-4" />
                        [ EXECUTE AUTO-HEAL ]
                      </button>
                    )}

                    <button 
                      onClick={handleDownload}
                      className="flex-1 flex justify-center items-center gap-2 px-5 py-3 bg-black text-white hover:bg-neutral-900 border border-neutral-800 transition-colors uppercase tracking-widest text-xs"
                    >
                      <Download className="w-4 h-4" />
                      [ DOWNLOAD SH ]
                    </button>
                    
                    <button 
                      onClick={handleCreatePR}
                      disabled={prLoading || !!prUrl}
                      className="flex-1 flex justify-center items-center gap-2 px-5 py-3 bg-black text-white hover:bg-neutral-900 border border-neutral-800 transition-colors uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <GitPullRequest className="w-4 h-4" />
                      {prLoading ? '[ DRAFTING... ]' : prUrl ? '[ PR CREATED ]' : '[ CREATE PR ]'}
                    </button>
                  </div>
                  
                  {prUrl && (
                    <div 
                      className="mt-4 p-3 border border-emerald-500 text-emerald-500 text-xs uppercase tracking-widest flex items-center gap-2 bg-emerald-500/5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      DRAFT PR: <a href={prUrl} target="_blank" rel="noreferrer" className="underline hover:text-emerald-300 ml-2">{prUrl}</a>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

