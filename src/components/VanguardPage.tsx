import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import AboutUs from './AboutUs';
import Contact from './Contact';

interface VanguardPageProps {
  onBack: () => void;
  initialSection?: 'about' | 'contact';
}

const VanguardPage: React.FC<VanguardPageProps> = ({ onBack, initialSection = 'about' }) => {
  const [activeSection, setActiveSection] = React.useState<'about' | 'contact'>(initialSection);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen void-bg relative overflow-x-hidden"
    >
      {/* Background Grid */}
      <div className="fixed inset-0 architectural-grid pointer-events-none opacity-5" />
      <div className="fixed inset-0 bg-gradient-to-b from-neon-red/5 via-transparent to-neon-orange/5 pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full h-20 bg-black/80 backdrop-blur-xl border-b border-white/5 z-[100] px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={onBack}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:text-neon-red transition-colors" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Return to Base</span>
          </motion.button>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 text-neon-red" />
            <span className="text-xl font-bold tracking-tighter text-white uppercase italic">Vanguard <span className="text-neon-red">Dossier</span></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveSection('about')}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 border ${
              activeSection === 'about' 
                ? 'bg-neon-red text-white border-neon-red shadow-[0_0_20px_rgba(255,49,49,0.5)] scale-110' 
                : 'text-white/40 border-white/10 hover:text-white hover:border-white/30'
            }`}
          >
            {activeSection === 'about' ? '⚡ The Vanguard' : 'The Team'}
          </button>
          <button
            onClick={() => setActiveSection('contact')}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 border ${
              activeSection === 'contact' 
                ? 'bg-neon-red text-white border-neon-red shadow-[0_0_20px_rgba(255,49,49,0.5)] scale-110' 
                : 'text-white/40 border-white/10 hover:text-white hover:border-white/30'
            }`}
          >
            {activeSection === 'contact' ? '🔥 Transmission' : 'Contact'}
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <main className="pt-20">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeSection === 'about' ? <AboutUs /> : <Contact />}
        </motion.div>
      </main>

      {/* Footer Decoration */}
      <div className="py-12 flex flex-col items-center justify-center opacity-20 pointer-events-none">
        <div className="h-px w-64 bg-gradient-to-r from-transparent via-white to-transparent mb-4" />
        <p className="text-[8px] uppercase tracking-[1em] text-white">End of Transmission</p>
      </div>
    </motion.div>
  );
};

export default VanguardPage;
