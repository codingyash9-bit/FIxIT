import React from 'react';
import { motion } from 'motion/react';
import { Send, Mail, MapPin, Phone, MessageSquare } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" className="relative py-32 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-4 py-1.5 rounded-full border border-neon-red/30 bg-neon-red/5 text-neon-red text-[10px] font-bold uppercase tracking-[0.4em] mb-6">
              Transmission Hub
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-8 uppercase">
              Send a <span className="text-neon-red">Pulse</span>
            </h2>
            <p className="text-white/50 text-lg mb-12 max-w-md leading-relaxed">
              Ready to initialize a project or just want to discuss the future of autonomous systems? Our frequency is always open.
            </p>

            <div className="space-y-8">
              <ContactInfoItem 
                icon={<Mail className="w-5 h-5 text-neon-red" />} 
                label="Direct Frequency" 
                value="vanguard@fixit.ai" 
              />
              <ContactInfoItem 
                icon={<MapPin className="w-5 h-5 text-neon-red" />} 
                label="Sector Location" 
                value="Neo-Tokyo / Sector 7" 
              />
              <ContactInfoItem 
                icon={<MessageSquare className="w-5 h-5 text-neon-red" />} 
                label="Cursed Communication" 
                value="@fixit_vanguard" 
              />
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Decorative Glow */}
            <div className="absolute -inset-4 bg-neon-red/5 blur-3xl rounded-full -z-10" />
            
            <form className="glass-panel p-8 md:p-12 rounded-3xl border-white/5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="contact-label">Identity Name</label>
                  <input type="text" placeholder="Goku / Itadori" className="w-full contact-input" />
                </div>
                <div>
                  <label className="contact-label">Frequency Address</label>
                  <input type="email" placeholder="name@domain.com" className="w-full contact-input" />
                </div>
              </div>

              <div>
                <label className="contact-label">Transmission Subject</label>
                <input type="text" placeholder="Project Initialization" className="w-full contact-input" />
              </div>

              <div>
                <label className="contact-label">Data Payload</label>
                <textarea rows={4} placeholder="Describe your mission..." className="w-full contact-input resize-none" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-neon-red text-white font-bold uppercase tracking-[0.3em] rounded-xl shadow-[0_0_20px_rgba(255,49,49,0.3)] hover:shadow-[0_0_40px_rgba(255,49,49,0.5)] transition-all flex items-center justify-center gap-3"
              >
                <Send className="w-4 h-4" />
                Initialize Transmission
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ContactInfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center gap-6 group">
    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-neon-red/50 group-hover:bg-neon-red/5 transition-all duration-300">
      {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">{label}</p>
      <p className="text-white font-medium tracking-tight">{value}</p>
    </div>
  </div>
);

export default Contact;
