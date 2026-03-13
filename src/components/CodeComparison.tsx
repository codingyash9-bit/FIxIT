import React, { useMemo } from 'react';
import { Copy, Check, AlertTriangle, CheckCircle2, ShieldCheck, Lightbulb } from 'lucide-react';

interface CodeComparisonProps {
  originalCode: string;
  fixedCode: string;
  bugLine?: number;
  explanation: string;
  changes: string[];
  prevention?: string;
}

const CodeBlock = ({ 
  code, 
  title, 
  bugLine, 
  isFixed, 
  accentColor 
}: { 
  code: string; 
  title: string; 
  bugLine?: number; 
  isFixed?: boolean; 
  accentColor: string;
}) => {
  const lines = useMemo(() => code.split('\n'), [code]);
  const [copied, setCopied] = React.useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex-1 flex flex-col bg-black/60 rounded-2xl border ${isFixed ? 'border-neon-orange/30 shadow-[0_0_30px_rgba(255,140,0,0.1)]' : 'border-white/5'} overflow-hidden tech-card group transition-all duration-500 hover:scale-[1.01]`}>
      <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-2.5 h-2.5 rounded-full ${accentColor} shadow-[0_0_12px_currentColor]`} />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/80">{title}</span>
        </div>
        <button 
          onClick={copyToClipboard}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 text-[10px] font-bold uppercase tracking-wider ${
            copied 
            ? 'bg-neon-orange text-black shadow-[0_0_15px_rgba(255,140,0,0.5)]' 
            : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy Code'}
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-8 font-mono text-[16px] leading-[1.8] relative custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02),transparent)]">
        {lines.map((line, i) => {
          const isBug = !isFixed && bugLine === (i + 1);
          return (
            <div 
              key={i} 
              className={`flex gap-6 relative group/line ${isBug ? 'bg-neon-red/10' : ''}`}
            >
              <span className="text-slate-600 select-none w-8 text-right shrink-0 opacity-40 font-mono text-[11px] mt-1">{i + 1}</span>
              <span className={`whitespace-pre relative z-10 transition-all duration-300 ${isBug ? 'text-white font-bold scale-[1.02] origin-left' : 'text-slate-300 group-hover/line:text-white'}`}>
                {line || ' '}
              </span>
              
              {isBug && (
                <>
                  <div 
                    className="absolute inset-y-0 -inset-x-4 bg-neon-red/10 -z-10 animate-pulse"
                  />
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-neon-red shadow-[0_0_20px_#FF3131]"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 px-3 py-1 bg-neon-red border border-neon-red/50 rounded-md shadow-[0_0_20px_rgba(255,49,49,0.6)] text-[9px] text-black font-black uppercase tracking-widest z-20 animate-bounce">
                    <AlertTriangle className="w-3.5 h-3.5" /> CRITICAL_EXCEPTION
                  </div>
                </>
              )}
              
              {isFixed && lines[i] !== code.split('\n')[i] && (
                <div className="absolute inset-y-0 -inset-x-4 bg-neon-orange/10 -z-10" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CodeComparison: React.FC<CodeComparisonProps> = ({ 
  originalCode, 
  fixedCode, 
  bugLine, 
  explanation,
  changes,
  prevention
}) => {
  return (
    <div className="space-y-12">
      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <CodeBlock 
          code={originalCode} 
          title="Detected_Anomaly" 
          bugLine={bugLine} 
          accentColor="bg-neon-red"
        />
        <CodeBlock 
          code={fixedCode} 
          title="Optimized_Resolution" 
          isFixed 
          accentColor="bg-neon-orange"
        />
      </div>

      {/* Analysis & Changes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel rounded-xl p-6 border-white/5 tech-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-neon-red/10 flex items-center justify-center border border-neon-red/20">
              <CheckCircle2 className="w-4 h-4 text-neon-red" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Analysis</h3>
          </div>
          <div className="text-slate-400 text-xs leading-relaxed space-y-4">
            <div className="p-4 bg-black/20 rounded-lg border border-white/5 italic">
              {explanation.replace(/### 🔎 Bug Explanation\n\n/, '')}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 border-white/5 tech-card">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Changes</h3>
          <div className="space-y-3">
            {changes.map((change, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-orange mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                <p className="text-[10px] text-slate-300 leading-tight">{change}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prevention Strategy */}
      {prevention && (
        <div className="glass-panel rounded-xl p-6 border-neon-orange/20 tech-card bg-neon-orange/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-neon-orange/10 flex items-center justify-center border border-neon-orange/20">
              <ShieldCheck className="w-4 h-4 text-neon-orange" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Prevention</h3>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-neon-orange/10 rounded-full shrink-0">
              <Lightbulb className="w-5 h-5 text-neon-orange animate-pulse" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                {prevention}
              </p>
              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-neon-orange" />
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">Type_Safety: Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-neon-orange" />
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">Runtime_Guard: Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
