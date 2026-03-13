import React from 'react';
import { motion } from 'motion/react';
import { Linkedin, Github, Instagram, Zap, Flame, Shield, Cpu } from 'lucide-react';

const teamMembers = [
  {
    name: "Yash Mahadeshvar",
    role: "Lead Vanguard",
    aura: "saiyan",
    powerLevel: "9001+",
    technique: "Architectural Transcendence",
    links: {
      linkedin: "https://www.linkedin.com/in/yash-mahadeshvar-bb1669280/",
      github: "https://github.com/codingyash9-bit",
      instagram: "https://www.instagram.com/coding_yash/"
    },
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4",
    description: "The core engine of the Vanguard. His code burns with the intensity of a dying star."
  },
  {
    name: "Ayush Sahu",
    role: "Frontend Sentinel",
    aura: "saiyan",
    powerLevel: "8500",
    technique: "Visual Domain Expansion",
    links: {
      linkedin: "https://www.linkedin.com/in/ayush-sahu-634329263/",
      github: "https://github.com/AyushSahu-gif",
      instagram: "https://www.instagram.com/aeyuss_777__/"
    },
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Caleb&backgroundColor=c0aede",
    description: "Crafting realities through pixels. Speed and precision are his only constants."
  },
  {
    name: "Sohaan Hawre",
    role: "Backend Sorcerer",
    aura: "cursed",
    powerLevel: "Cursed Grade 1",
    technique: "Logic Exorcism",
    links: {
      linkedin: "https://www.linkedin.com/in/sohaan-hawre-134a8439b/",
      github: "https://github.com/Karracksss",
      instagram: "https://www.instagram.com/sohaan.xawer/"
    },
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper&backgroundColor=ffdfbf",
    description: "Master of the unseen. He binds the chaos of data into perfect, cursed order."
  },
  {
    name: "Om Sawant",
    role: "Infra Tactician",
    aura: "cursed",
    powerLevel: "Special Grade",
    technique: "Void Orchestration",
    links: {
      linkedin: "https://www.linkedin.com/in/om-sawant-4354b33b4/",
      github: "https://github.com/OmSawant249",
      instagram: "https://www.instagram.com/omi_was_here/"
    },
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Julian&backgroundColor=ffd5dc",
    description: "The ghost in the machine. He commands the infrastructure from the shadows."
  }
];

const TeamCard = ({ member }: { member: typeof teamMembers[0] }) => {
  const isSaiyan = member.aura === 'saiyan';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className={`relative group p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 transition-all duration-500 overflow-hidden ${
        isSaiyan ? 'hover:aura-saiyan-active' : 'hover:aura-cursed-active'
      }`}
    >
      {/* Background Energy Glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none ${
        isSaiyan ? 'bg-saiyan-gold' : 'bg-cursed-purple'
      }`} />

      {/* Hexagonal Avatar Placeholder */}
      <div className="relative mb-8 flex justify-center">
        <div className={`w-40 h-40 hex-clip border-2 flex items-center justify-center relative z-10 bg-black/60 backdrop-blur-sm transition-all duration-500 ${
          isSaiyan ? 'border-saiyan-gold/40 group-hover:border-saiyan-gold group-hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]' : 'border-cursed-purple/40 group-hover:border-cursed-purple group-hover:shadow-[0_0_30px_rgba(138,43,226,0.5)]'
        }`}>
          <img 
            src={member.avatar} 
            alt={member.name} 
            className="w-full h-full object-contain p-4 grayscale group-hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Aura Ring */}
        <div className={`absolute inset-[-10px] border-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-spin-slow ${
          isSaiyan ? 'border-saiyan-gold/20' : 'border-cursed-purple/20'
        }`} />
      </div>

      {/* Info */}
      <div className="text-center relative z-10">
        <h3 className={`text-3xl font-bold tracking-tighter mb-1 transition-colors duration-300 ${
          isSaiyan ? 'group-hover:text-saiyan-gold' : 'group-hover:text-cursed-purple'
        }`}>
          {member.name}
        </h3>
        <p className="text-white/50 text-[10px] uppercase tracking-[0.3em] mb-4 font-mono font-bold">
          {member.role}
        </p>

        {/* Power Stats */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-white/40">
            <span>Power Level</span>
            <span className={isSaiyan ? 'text-saiyan-gold' : 'text-cursed-purple'}>{member.powerLevel}</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '85%' }}
              className={`h-full ${isSaiyan ? 'bg-saiyan-gold' : 'bg-cursed-purple'} animate-power-pulse`}
            />
          </div>
        </div>

        <p className="text-sm text-white/70 mb-8 leading-relaxed italic font-light">
          "{member.description}"
        </p>

        {/* Social Links */}
        <div className="flex justify-center gap-4">
          <SocialLink href={member.links.linkedin} icon={<Linkedin className="w-5 h-5" />} color={isSaiyan ? 'hover:text-saiyan-gold hover:shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'hover:text-cursed-purple hover:shadow-[0_0_15px_rgba(138,43,226,0.5)]'} />
          <SocialLink href={member.links.github} icon={<Github className="w-5 h-5" />} color={isSaiyan ? 'hover:text-saiyan-gold hover:shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'hover:text-cursed-purple hover:shadow-[0_0_15px_rgba(138,43,226,0.5)]'} />
          <SocialLink href={member.links.instagram} icon={<Instagram className="w-5 h-5" />} color={isSaiyan ? 'hover:text-saiyan-gold hover:shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'hover:text-cursed-purple hover:shadow-[0_0_15px_rgba(138,43,226,0.5)]'} />
        </div>
      </div>
    </motion.div>
  );
};

const SocialLink = ({ href, icon, color }: { href: string, icon: React.ReactNode, color: string }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -5, scale: 1.1 }}
    className={`p-3 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 ${color} hover:bg-white/10 hover:border-white/20`}
  >
    {icon}
  </motion.a>
);

const AboutUs = () => {
  return (
    <section id="about-us" className="relative py-32 px-8 void-bg min-h-screen">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-2 rounded-full border border-neon-red/30 bg-neon-red/5 text-neon-red text-[10px] font-black uppercase tracking-[0.5em] mb-8"
          >
            Vanguard Dossier
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-9xl font-black text-white tracking-tighter mb-8 uppercase italic"
          >
            Meet the <span className="text-neon-red">Vanguard</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/40 max-w-3xl mx-auto text-xl leading-relaxed font-medium uppercase tracking-widest"
          >
            Elite developers forged in the fires of production. Powered by cursed logic and saiyan determination.
          </motion.p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {teamMembers.map((member, index) => (
            <TeamCard key={index} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
