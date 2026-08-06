import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, GitPullRequest, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

export const IncidentModal = ({ incident, onClose }: { incident: any, onClose: () => void }) => {
  const [prLoading, setPrLoading] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);

  if (!incident) return null;

  const handleDownload = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/fix/${incident.id}`, { method: 'POST' });
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
      const res = await fetch(`http://localhost:5000/api/github/pr/${incident.id}`, { method: 'POST' });
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#111115] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto terminal-scroll shadow-2xl relative"
        >
          <div className="sticky top-0 bg-[#111115]/90 backdrop-blur-md p-6 border-b border-white/10 flex justify-between items-start z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-bold tracking-wider">
                  {incident.severity}
                </span>
                <h2 className="text-xl font-bold">{incident.service}</h2>
              </div>
              <p className="text-white/60 text-sm">Incident ID: {incident.id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {!incident.aiAnalysis ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/50">
                <Zap className="w-8 h-8 mb-4 animate-pulse text-blue-400" />
                <p>AI Analysis is currently running...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3 text-white/60">
                      <AlertTriangle className="w-4 h-4" />
                      <h3 className="font-semibold text-sm uppercase tracking-wider">Root Cause Analysis</h3>
                    </div>
                    <p className="text-lg font-medium text-white/90 mb-4">{incident.aiAnalysis.rootCause}</p>
                    <p className="text-sm text-white/70 leading-relaxed">{incident.aiAnalysis.explanation}</p>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col justify-center items-center text-center">
                    <h3 className="text-white/60 font-semibold text-sm uppercase tracking-wider mb-2">AI Confidence</h3>
                    <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                        <circle cx="64" cy="64" r="56" stroke="#3b82f6" strokeWidth="12" fill="none" 
                          strokeDasharray="351" strokeDashoffset={351 - (351 * incident.aiAnalysis.confidence) / 100} 
                          className="transition-all duration-1000 ease-out" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold">{incident.aiAnalysis.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3 text-white/60">
                    <CheckCircle2 className="w-4 h-4" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider">Recommended Fix</h3>
                  </div>
                  <p className="text-sm text-white/80 mb-4">{incident.aiAnalysis.fix}</p>
                  
                  <div className="bg-black/50 border border-white/10 rounded-lg p-4 font-mono text-sm text-blue-300 overflow-x-auto">
                    {incident.aiAnalysis.commands.map((cmd: string, idx: number) => (
                      <div key={idx}>$ {cmd}</div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4">
                    <button 
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download Fix Script
                    </button>
                    
                    <button 
                      onClick={handleCreatePR}
                      disabled={prLoading || !!prUrl}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium disabled:opacity-50 cursor-pointer"
                    >
                      <GitPullRequest className="w-4 h-4" />
                      {prLoading ? 'Drafting PR...' : prUrl ? 'PR Created' : 'Create Draft PR'}
                    </button>
                  </div>
                  
                  {prUrl && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      className="mt-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Successfully generated draft pull request: <a href={prUrl} target="_blank" rel="noreferrer" className="underline hover:text-green-300">{prUrl}</a>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
