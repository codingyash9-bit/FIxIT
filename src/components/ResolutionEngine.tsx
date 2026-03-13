import React from 'react';
import { motion } from 'motion/react';
import { Zap, Activity, Shield, Terminal } from 'lucide-react';

interface ResolutionEngineProps {
  reasoning: string[];
  status: 'IDLE' | 'ANALYZING' | 'FIXING' | 'RESOLVED';
}

export const ResolutionEngine: React.FC<ResolutionEngineProps> = ({ reasoning, status }) => {
  return (
    <div className="glass-panel rounded-xl p-8 relative overflow-hidden neon-border-red tech-card">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Activity className="w-32 h-32 text-neon-red" />
      </div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
            status === 'FIXING' ? 'bg-neon-orange/20 border-neon-orange shadow-[0_0_15px_rgba(255,140,0,0.3)]' : 
            status === 'RESOLVED' ? 'bg-neon-orange/20 border-neon-orange shadow-[0_0_15px_rgba(255,140,0,0.3)]' :
            'bg-neon-red/20 border-neon-red shadow-[0_0_15px_rgba(255,49,49,0.3)]'
          }`}>
            <Zap className={`w-6 h-6 ${
              status === 'FIXING' ? 'text-neon-orange' : 
              status === 'RESOLVED' ? 'text-neon-orange' : 
              'text-neon-red'
            } ${status !== 'IDLE' ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight uppercase tracking-widest">
              Resolution_Engine_v4.0
            </h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
              status === 'FIXING' ? 'text-neon-orange' : 
              status === 'RESOLVED' ? 'text-neon-orange' : 
              'text-neon-red'
            }`}>
              Status: {status}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-gray" />
          <span className="text-[10px] text-slate-gray font-mono uppercase">Secure_Link_Active</span>
        </div>
      </div>

      <div className="space-y-4 min-h-[300px] bg-black/60 rounded-xl p-8 border border-white/10 font-mono relative z-10 shadow-inner">
        {reasoning.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-slate-gray">
            <Terminal className="w-10 h-10 mb-6 opacity-20" />
            <p className="text-sm uppercase tracking-[0.4em] animate-pulse font-bold">Waiting for telemetry input...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reasoning.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`text-[13px] leading-relaxed flex gap-6 p-2 rounded-lg transition-colors hover:bg-white/5 ${
                  step.startsWith('>>') ? 'text-neon-orange font-bold bg-neon-orange/5' : 
                  step.startsWith('[RESOLVED]') ? 'text-neon-orange font-black border border-neon-orange/20 bg-neon-orange/10 px-4' :
                  step.startsWith('[ANALYZING]') ? 'text-electric-yellow' : 'text-slate-300'
                }`}
              >
                <span className="text-slate-gray opacity-30 shrink-0 font-bold">[{i.toString().padStart(2, '0')}]</span>
                <span className="break-all tracking-wide">{step}</span>
              </motion.div>
            ))}
            {status !== 'IDLE' && status !== 'RESOLVED' && (
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-[13px] text-neon-red font-black flex gap-6 p-2 bg-neon-red/5 rounded-lg"
              >
                <span className="text-slate-gray opacity-30 font-bold">[{reasoning.length.toString().padStart(2, '0')}]</span>
                <span className="tracking-[0.2em] animate-pulse">EXECUTING_LOGIC_FLOW...</span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-red/20 to-transparent" />
      <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-neon-red/20 to-transparent" />
    </div>
  );
};
