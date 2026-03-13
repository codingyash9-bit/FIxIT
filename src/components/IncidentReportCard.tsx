import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Terminal, 
  FileCode, 
  Activity,
  ArrowRight,
  Cpu,
  Shield,
  Zap
} from 'lucide-react';

const TypewriterText = ({ text, delay = 20 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return <span>{displayedText}<span className="animate-pulse">_</span></span>;
};

interface CodeDiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}

interface IncidentReportCardProps {
  incidentTitle: string;
  status: 'resolving' | 'fixed' | 'failed';
  executiveSummary: string;
  technicalRCA: string;
  codeDiff?: CodeDiffLine[];
  confidence?: number;
  executionTime?: string;
}

const TechIndicator = ({ label, value, tooltip }: { label: string; value: string; tooltip: string }) => (
  <div className="flex flex-col gap-1 group/indicator relative">
    <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{label}</span>
    <span className="text-[10px] font-mono text-gray-400 group-hover/indicator:text-electric-cyan transition-colors">{value}</span>
    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 border border-gray-800 rounded text-[9px] text-gray-400 opacity-0 group-hover/indicator:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
      <span className="font-bold text-electric-cyan block mb-1">HUMAN_TRANSLATION:</span>
      {tooltip}
    </div>
  </div>
);

const MiniGraph = () => {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[40, 70, 45, 90, 65, 30, 85, 50, 75, 40].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: i * 0.05, duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="w-1 bg-electric-cyan/40 rounded-t-[1px]"
        />
      ))}
    </div>
  );
};

const IncidentReportCard: React.FC<IncidentReportCardProps> = ({
  incidentTitle,
  status,
  executiveSummary,
  technicalRCA,
  codeDiff,
  confidence = 98.4,
  executionTime = "142ms"
}) => {
  const [isRCAOpen, setIsRCAOpen] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);

  const statusConfig = {
    resolving: {
      color: 'text-neon-orange',
      bg: 'bg-neon-orange/10',
      border: 'border-neon-orange/20',
      icon: Loader2,
      label: 'Resolving',
      pulse: true
    },
    fixed: {
      color: 'text-neon-orange',
      bg: 'bg-neon-orange/10',
      border: 'border-neon-orange/20',
      icon: CheckCircle2,
      label: 'Resolved',
      pulse: false
    },
    failed: {
      color: 'text-neon-red',
      bg: 'bg-neon-red/10',
      border: 'border-neon-red/20',
      icon: AlertCircle,
      label: 'Failed',
      pulse: false
    }
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="w-full max-w-2xl mx-auto border border-white/10 rounded-xl bg-deep-charcoal overflow-hidden shadow-2xl relative group/card">
      {/* Scanning Line */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="w-full h-[1px] bg-neon-red/20 absolute top-0 animate-scan" />
      </div>

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-red/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
        <div className="flex items-center gap-3 relative z-10">
          <div className={`relative flex items-center justify-center`}>
            {currentStatus.pulse && (
              <div className={`absolute inset-0 rounded-full ${currentStatus.bg} animate-ping opacity-75`} />
            )}
            <StatusIcon className={`w-4 h-4 ${currentStatus.color} relative z-10`} />
          </div>
          <h2 className="text-sm font-medium text-white tracking-tight group-hover/card:text-neon-red transition-colors uppercase tracking-widest">{incidentTitle}</h2>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <MiniGraph />
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}>
            {currentStatus.label}
          </div>
        </div>
      </div>

      {/* Tech Metrics Bar */}
      <div className="px-6 py-3 border-b border-white/5 bg-black/40 flex items-center gap-8">
        <TechIndicator 
          label="Confidence" 
          value={`${confidence}%`} 
          tooltip="AI confidence rating for this remediation path."
        />
        <TechIndicator 
          label="Exec_Time" 
          value={executionTime} 
          tooltip="Total latency from detection to patch application."
        />
        <TechIndicator 
          label="Impact" 
          value="LOW" 
          tooltip="Risk assessment of the applied code changes."
        />
        <div className="ml-auto flex items-center gap-2">
          <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              className="h-full bg-neon-orange"
            />
          </div>
        </div>
      </div>

      {/* Executive Summary (TL;DR) */}
      <div className="px-6 py-5 bg-white/[0.01] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5">
          <Shield className="w-12 h-12 text-neon-red" />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-3.5 h-3.5 text-slate-gray" />
          <span className="text-[10px] font-bold text-slate-gray uppercase tracking-widest">Executive Summary</span>
        </div>
        <p className="text-sm text-white leading-relaxed font-sans min-h-[3rem]">
          <TypewriterText text={executiveSummary} />
        </p>
      </div>

      {/* Technical Accordions */}
      <div className="border-t border-white/5">
        {/* RCA Section */}
        <div className="border-b border-white/5">
          <button 
            onClick={() => setIsRCAOpen(!isRCAOpen)}
            className="w-full px-6 py-3 flex items-center justify-between hover:bg-white/[0.01] transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-gray group-hover:text-white transition-colors" />
              <span className="text-[10px] font-bold text-slate-gray uppercase tracking-widest group-hover:text-white transition-colors">Root Cause Analysis</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-gray transition-transform duration-300 ${isRCAOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {isRCAOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 pt-1">
                  <div className="p-4 rounded-lg bg-black/60 border border-white/5 font-mono text-[11px] text-slate-gray leading-relaxed whitespace-pre-wrap">
                    {technicalRCA}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Code Diff Section */}
        {codeDiff && (
          <div>
            <button 
              onClick={() => setIsDiffOpen(!isDiffOpen)}
              className="w-full px-6 py-3 flex items-center justify-between hover:bg-white/[0.01] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-slate-gray group-hover:text-white transition-colors" />
                <span className="text-[10px] font-bold text-slate-gray uppercase tracking-widest group-hover:text-white transition-colors">Applied Fix (Diff)</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-gray transition-transform duration-300 ${isDiffOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
              {isDiffOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 pt-1">
                    <div className="rounded-lg border border-white/5 overflow-hidden font-mono text-[11px] bg-black/60">
                      {codeDiff.map((line, idx) => (
                        <div 
                          key={idx}
                          className={`flex gap-4 px-4 py-0.5 ${
                            line.type === 'added' ? 'bg-neon-orange/10 text-neon-orange border-l-2 border-neon-orange' :
                            line.type === 'removed' ? 'bg-neon-red/10 text-neon-red border-l-2 border-neon-red' :
                            'text-slate-gray'
                          }`}
                        >
                          <span className="w-8 select-none opacity-30 text-right">{idx + 1}</span>
                          <span className="w-2 select-none opacity-50">
                            {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                          </span>
                          <span className="whitespace-pre">{line.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer / Action */}
      <div className="px-6 py-3 border-t border-white/5 flex justify-end">
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-gray hover:text-neon-red transition-colors uppercase tracking-widest">
          View Full Report <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default IncidentReportCard;
