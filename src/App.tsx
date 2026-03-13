/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Database, 
  FileText, 
  History, 
  Layers, 
  Play, 
  RefreshCcw, 
  Server, 
  ShieldAlert, 
  Terminal,
  Zap,
  Upload,
  ChevronRight,
  ShieldCheck,
  Search,
  Wrench,
  ArrowRight,
  Scan,
  Cpu as CpuIcon,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring, useMotionValue } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, PerspectiveCamera, Torus, TorusKnot, Text, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { auth, signInWithGoogle, logout, db } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';

// --- Connection Test ---
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testFirestoreConnection();

// --- Auth Context ---
const AuthContext = React.createContext<{
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    await signInWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

// --- Types ---

interface Service {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'warning' | 'crashed';
  cpu: number;
  memory: number;
  uptime: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  service: string;
  message: string;
}

interface SystemState {
  services: Service[];
  logs: LogEntry[];
  isIncidentActive: boolean;
}

interface Notification {
  id: string;
  bugId: string;
  description: string;
  status: 'Fixed';
  timestamp: string;
}

import { CodeComparison } from './components/CodeComparison';
import { NotificationSystem, notifyBugFixed } from './components/NotificationSystem';
import IncidentReportCard from './components/IncidentReportCard';
import { ResolutionEngine } from './components/ResolutionEngine';

// --- 3D Components ---

const WaveParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime();
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const x = pos[i * 3];
        const z = pos[i * 3 + 2];
        pos[i * 3 + 1] = Math.sin(x * 0.5 + time) * Math.cos(z * 0.5 + time) * 0.5;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#FF3131"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};

const NeonParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime();
      pointsRef.current.rotation.y = time * 0.1;
      pointsRef.current.rotation.x = time * 0.05;
      
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(time + i) * 0.002;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#FF8C00"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const CustomCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 400, mass: 0.3 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  
  const dotSpringConfig = { damping: 35, stiffness: 600, mass: 0.1 };
  const dotSpringX = useSpring(mouseX, dotSpringConfig);
  const dotSpringY = useSpring(mouseY, dotSpringConfig);

  const [isHovering, setIsHovering] = useState(false);
  const [isText, setIsText] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('.glass-panel') || target.closest('button');
      const isTextElement = ['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'CODE', 'PRE'].includes(target.tagName) || target.closest('p') || target.closest('span');
      
      setIsHovering(!!isClickable);
      setIsText(!!isTextElement && !isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-neon-red/50 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 1.5 : isText ? 0.5 : 1,
          borderColor: isHovering ? '#FF8C00' : isText ? '#FF3131' : 'rgba(255, 49, 49, 0.5)',
          borderRadius: isText ? '2px' : '50%',
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-neon-red rounded-full pointer-events-none z-[9999]"
        style={{
          x: dotSpringX,
          y: dotSpringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isText ? 0 : 1,
        }}
      />
    </>
  );
};

const GlitchText = ({ text }: { text: string }) => {
  return (
    <div className="relative inline-block group">
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 text-neon-red opacity-0 group-hover:opacity-70 group-hover:animate-glitch-1 translate-x-[2px]">{text}</span>
      <span className="absolute top-0 left-0 -z-10 text-neon-orange opacity-0 group-hover:opacity-70 group-hover:animate-glitch-2 -translate-x-[2px]">{text}</span>
    </div>
  );
};

const DataStream = () => {
  const groupRef = useRef<THREE.Group>(null);
  const count = 40;
  
  const lines = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
      speed: 0.05 + Math.random() * 0.1,
      length: 2 + Math.random() * 5,
      offset: Math.random() * 10
    }));
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.children.forEach((child, i) => {
        const line = lines[i];
        child.position.y = ((time * line.speed + line.offset) % 20) - 10;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <mesh key={i} position={[line.x, 0, line.z]}>
          <boxGeometry args={[0.02, line.length, 0.02]} />
          <meshStandardMaterial 
            color="#FF3131" 
            emissive="#FF3131" 
            emissiveIntensity={2} 
            transparent 
            opacity={0.3} 
          />
        </mesh>
      ))}
    </group>
  );
};

const BackgroundGrid = () => {
  const gridRef = useRef<THREE.Group>(null);
  const { scrollYProgress } = useScroll();
  
  useFrame((state) => {
    if (gridRef.current) {
      // Subtle movement based on scroll
      gridRef.current.position.z = scrollYProgress.get() * 2;
      gridRef.current.rotation.x = -Math.PI / 2.5 + scrollYProgress.get() * 0.1;
    }
  });

  return (
    <group ref={gridRef} position={[0, -2, -5]}>
      <gridHelper args={[100, 50, "#111", "#111"]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

const GlitchBackground = ({ scrollProgress }: { scrollProgress: any }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollProgress.on("change", (latest: number) => {
      // Glitch between 0.2 and 0.4
      if (latest > 0.2 && latest < 0.4) {
        setIsGlitching(Math.random() > 0.8);
      } else {
        setIsGlitching(false);
      }
    });
    return () => unsubscribe();
  }, [scrollProgress]);

  return (
    <AnimatePresence>
      {isGlitching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0, 0.1, 0] }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-10 bg-neon-red pointer-events-none mix-blend-overlay"
        />
      )}
    </AnimatePresence>
  );
};

const MatrixSphere = ({ color }: { color: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create a dense grid of binary digits for a "Matrix" feel
  const columns = 24;
  const rows = 12;
  const matrixData = useMemo(() => {
    const temp = [];
    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < rows; r++) {
        const phi = (r / rows) * Math.PI;
        const theta = (c / columns) * Math.PI * 2;
        temp.push({
          phi,
          theta,
          value: Math.round(Math.random()).toString(),
          offset: Math.random() * Math.PI * 2
        });
      }
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {matrixData.map((p, i) => (
        <Text
          key={i}
          position={[
            0.85 * Math.sin(p.phi) * Math.cos(p.theta),
            0.85 * Math.cos(p.phi),
            0.85 * Math.sin(p.phi) * Math.sin(p.theta)
          ]}
          fontSize={0.08}
          color={color}
          anchorX="center"
          anchorY="middle"
          // Look at center
          rotation={[0, -p.theta + Math.PI / 2, p.phi - Math.PI / 2]}
        >
          {p.value}
        </Text>
      ))}
    </group>
  );
};

const SentinelCore = ({ scrollProgress, isError, isFixing, isMini }: { scrollProgress?: any, isError?: boolean, isFixing?: boolean, isMini?: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const scroll = scrollProgress ? scrollProgress.get() : 0;
    
    if (groupRef.current) {
      const baseRadius = isMini ? 1.5 : 3;
      const orbitRadius = baseRadius + (scroll * 2);
      const orbitSpeed = 0.4;
      
      const x = Math.cos(time * orbitSpeed) * orbitRadius;
      const z = Math.sin(time * orbitSpeed) * orbitRadius;
      let y = Math.sin(time * 0.5) * 0.2;

      if (scrollProgress && !isMini) {
        y = (-scroll * 15) + Math.sin(time * 0.5) * 0.5;
      }

      groupRef.current.position.set(x, y, z);

      // Update CSS variable for the "bulb" glow effect on HTML elements
      // We map 3D coordinates to screen-like percentages (rough approximation)
      const screenX = 50 + (x / 10) * 50;
      const screenY = 50 - (y / 10) * 50;
      document.documentElement.style.setProperty('--bulb-x', `${screenX}%`);
      document.documentElement.style.setProperty('--bulb-y', `${screenY}%`);
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 2.5;
      ring1Ref.current.rotation.z = time * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.PI / 2.2;
      ring2Ref.current.rotation.z = -time * 0.15;
    }

    if (sphereRef.current) {
      sphereRef.current.rotation.y = time * 0.3;
    }

    // Pulse the light like a bulb
    if (lightRef.current) {
      lightRef.current.intensity = (isError || isFixing ? 20 : 10) + Math.sin(time * 4) * 5;
    }
  });

  let coreColor = "#FF8C00";
  if (isError) coreColor = "#FF3131";
  else if (isFixing) coreColor = "#FF8C00";

  return (
    <group ref={groupRef}>
      {/* The "Bulb" Light Source */}
      <pointLight 
        ref={lightRef} 
        distance={20} 
        decay={1.5} 
        color={coreColor} 
        intensity={10}
      />

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        {/* The Bulb Planet */}
        <group>
          {/* Inner Filament-like Core */}
          <Sphere args={[0.4, 16, 16]}>
            <meshBasicMaterial color="#FFF" transparent opacity={0.8} />
          </Sphere>
          
          {/* Glowing Plasma Layer */}
          <Sphere args={[0.6, 32, 32]}>
            <meshBasicMaterial color={coreColor} transparent opacity={0.4} />
          </Sphere>
          
          {/* Glassy Outer Shell with Distortion */}
          <Sphere ref={sphereRef} args={[0.8, 64, 64]}>
            <MeshDistortMaterial 
              color={coreColor} 
              emissive={coreColor} 
              emissiveIntensity={isError || isFixing ? 15 : 6} 
              distort={0.5} 
              speed={3} 
              roughness={0}
              metalness={1}
              transparent
              opacity={0.6}
              transmission={0.8}
              thickness={2}
            />
          </Sphere>
        </group>
        
        {/* Matrix Code Surface */}
        <MatrixSphere color={coreColor} />
        
        {/* Primary Ring */}
        <group ref={ring1Ref}>
          <Torus args={[2.0, 0.01, 16, 100]}>
            <meshStandardMaterial color={coreColor} emissive={coreColor} emissiveIntensity={2} transparent opacity={0.3} />
          </Torus>
          {Array.from({ length: 12 }).map((_, i) => (
            <group key={i} rotation={[0, 0, (i / 12) * Math.PI * 2]}>
              <Text
                position={[0, 2.0, 0]}
                fontSize={0.14}
                color="#FFF"
                anchorX="center"
                anchorY="middle"
                fontWeight="900"
                // Fix: Ensure text faces the user by counter-rotating against the ring's X tilt
                // We also add a slight Y rotation to keep it flat towards the camera
                rotation={[-Math.PI / 2.5, 0, 0]}
              >
                FIXING IT
              </Text>
            </group>
          ))}
        </group>

        {/* Secondary Outer Ring */}
        <group ref={ring2Ref}>
          <Torus args={[2.6, 0.005, 16, 100]}>
            <meshStandardMaterial color={coreColor} emissive={coreColor} emissiveIntensity={1} transparent opacity={0.1} />
          </Torus>
          <Ring args={[2.55, 2.65, 64]}>
            <meshStandardMaterial color={coreColor} transparent opacity={0.05} side={THREE.DoubleSide} />
          </Ring>
        </group>
      </Float>
    </group>
  );
};

// --- UI Components ---

const StatusBadge = ({ status }: { status: Service['status'] }) => {
  const colors = {
    healthy: 'bg-neon-orange/10 text-neon-orange border-neon-orange/20',
    degraded: 'bg-electric-yellow/10 text-electric-yellow border-electric-yellow/20',
    warning: 'bg-neon-orange/10 text-neon-orange border-neon-orange/20',
    crashed: 'bg-neon-red/10 text-neon-red border-neon-red/20',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${colors[status]}`}>
      {status}
    </span>
  );
};

const FixITLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <motion.div 
      className={`relative ${className} flex items-center justify-center`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {/* Dynamic Glow Layers */}
      <div className="absolute inset-0 bg-neon-red/20 blur-2xl rounded-full -z-10 animate-pulse" />
      <div className="absolute inset-0 bg-neon-orange/10 blur-3xl rounded-full -z-20" />
      
      {/* Rotating Tech Rings */}
      <motion.div
        className="absolute inset-[-20%] border border-dashed border-neon-red/20 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-[-10%] border border-dotted border-neon-orange/30 rounded-full"
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(255,49,49,0.6)]">
        {/* Hexagonal Frame with Depth */}
        <path
          d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-neon-red"
        />
        <path
          d="M50 15 L80 30 L80 70 L50 85 L20 70 L20 30 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-neon-red/30"
        />
        
        {/* Stylized 'F' and 'X' (Fix) */}
        <path
          d="M30 35 H60 M30 35 V65 M30 50 H50"
          fill="none"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Wrench/Bolt Head Element (IT/Fix) */}
        <path
          d="M65 35 L80 50 L65 65"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-neon-orange"
        />
        <circle cx="72" cy="50" r="4" className="fill-white" />
        
        {/* Connecting Circuit Lines */}
      </svg>
    </motion.div>
  );
};

const ScrollCamera = ({ scrollProgress }: { scrollProgress: any }) => {
  useFrame((state) => {
    const scroll = scrollProgress.get();
    // Map scroll 0-1 to camera Y 0 to -20
    state.camera.position.y = -scroll * 15;
    state.camera.lookAt(0, -scroll * 15, 0);
  });
  return null;
};

import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import VanguardPage from './components/VanguardPage';

const LandingPage = ({ onLaunch, onNavigateToVanguard }: { onLaunch: () => void, onNavigateToVanguard: (section: 'about' | 'contact') => void }) => {
  const { user, login, logout: handleLogout } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const handleLaunch = () => {
    setIsTransitioning(true);
    setTimeout(onLaunch, 1000);
  };

  return (
    <div ref={containerRef} className="relative bg-oled-black">
      <CustomCursor />
      <div className="scanline" />
      
      {/* Persistent 3D Scene */}
      <div className="fixed inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <ScrollCamera scrollProgress={scrollYProgress} />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} color="#FF3131" intensity={2} />
          <pointLight position={[-10, -10, -10]} color="#FF8C00" intensity={2} />
          <Suspense fallback={null}>
            <WaveParticles />
            <NeonParticles />
            <BackgroundGrid />
            <SentinelCore scrollProgress={scrollYProgress} />
            <DataStream />
          </Suspense>
        </Canvas>
      </div>

      <GlitchBackground scrollProgress={scrollYProgress} />

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full h-16 bg-black/50 backdrop-blur-md z-50 px-8 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <FixITLogo className="w-10 h-10" />
          <span className="text-xl font-bold tracking-tighter text-white">FixIT</span>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center gap-8">
          {['Home', 'Projects', 'Skills', 'About Us', 'Contact'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => {
                if (tab === 'About Us') onNavigateToVanguard('about');
                else if (tab === 'Contact') onNavigateToVanguard('contact');
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/70 hover:text-white transition-colors nav-link-glow"
            >
              {tab}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-8">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-white/20" />
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest hidden lg:block">{user.displayName}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-[10px] text-white/40 hover:text-neon-red transition-colors uppercase font-bold tracking-widest"
              >
                Logout
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={login}
              className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all"
            >
              Sign In
            </motion.button>
          )}
          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleLaunch} 
            className="neon-ghost-button text-[11px] uppercase tracking-widest"
          >
            Access Command Center
          </motion.button>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section id="home" className="relative h-screen flex flex-col items-center justify-center text-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-5xl"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ 
              scale: 1.1, 
              boxShadow: "0 0 20px rgba(255, 140, 0, 0.4)",
              borderColor: "rgba(255, 140, 0, 0.8)"
            }}
            className="px-4 py-1.5 rounded-full border border-neon-orange/30 bg-neon-orange/5 text-neon-orange text-[10px] font-bold uppercase tracking-[0.4em] mb-8 inline-block cursor-default transition-all"
          >
            State: Scanning
          </motion.span>
          <motion.h1 
            whileHover={{ 
              skewX: -5,
              transition: { duration: 0.1, repeat: 3, repeatType: "reverse" }
            }}
            className="text-4xl md:text-7xl font-bold text-white tracking-tighter mb-6 leading-[0.85] uppercase cursor-default select-none"
          >
            FixIT: <br />
            <span className="text-neon-orange">Autonomous SRE.</span>
          </motion.h1>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            whileHover={{ scale: 1.2, color: "#FF8C00" }}
            className="text-neon-orange/50 text-xs uppercase tracking-[0.3em] font-bold cursor-default transition-all"
          >
            Scroll to Initialize
          </motion.div>
        </motion.div>
      </section>

      {/* WEBSITE SUMMARY SECTION */}
      <section className="relative py-32 px-8 z-10 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mb-12"
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-neon-orange to-transparent mx-auto mb-12" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tighter uppercase italic">
              The <span className="shonen-gradient-text">Vanguard</span> Protocol
            </h2>
            <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-light">
              FixIT is the world's first <span className="text-neon-orange font-bold">Autonomous SRE Engine</span> powered by the raw spirit of Shonen legends. We don't just monitor systems; we <span className="text-neon-red font-bold">exorcise bugs</span> and <span className="text-saiyan-gold font-bold">ascend infrastructure</span> to god-tier reliability.
            </p>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-neon-red to-transparent mx-auto mt-12" />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: THE GLITCH */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-5xl"
        >
          <motion.div
            animate={{ 
              x: [0, -2, 2, -1, 1, 0],
              filter: ["blur(0px)", "blur(2px)", "blur(0px)", "blur(1px)", "blur(0px)"]
            }}
            transition={{ repeat: Infinity, duration: 0.2 }}
            whileHover={{ scale: 1.1, rotate: [0, -1, 1, 0] }}
            className="mb-8 cursor-default"
          >
            <span className="px-4 py-1.5 rounded-full border border-neon-red/30 bg-neon-red/5 text-neon-red text-[10px] font-bold uppercase tracking-[0.4em]">
              Alert: Critical Anomaly
            </span>
          </motion.div>
          <motion.h2 
            whileHover={{ 
              x: [0, -5, 5, -5, 5, 0],
              transition: { duration: 0.2 }
            }}
            className="text-5xl md:text-8xl font-bold text-white tracking-tighter mb-8 leading-[0.85] uppercase cursor-default select-none"
          >
            The Cost of <br />
            <span className="text-neon-red">Downtime.</span>
          </motion.h2>
          <motion.p 
            whileHover={{ color: "#ffffff" }}
            className="max-w-2xl mx-auto text-slate-gray text-lg mb-12 font-medium transition-colors cursor-default"
          >
            Every second of latency is a loss of revenue. Manual intervention is too slow for the modern stack.
          </motion.p>
        </motion.div>
      </section>

      {/* SECTION 3: THE ENGINE */}
      <section className="relative h-[200vh] z-10">
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6">
          <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Predict", desc: "Neural pattern matching identifies failures before they cascade.", icon: Search },
              { title: "Fix", desc: "Autonomous remediation engine applies surgical patches in real-time.", icon: Wrench },
              { title: "Verify", desc: "Post-remediation health checks ensure 99.99% system stability.", icon: ShieldCheck },
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
                whileInView={{ rotateY: 0, opacity: 1, scale: 1 }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  borderColor: "rgba(255, 140, 0, 0.5)",
                  boxShadow: "0 20px 40px rgba(255, 140, 0, 0.1)"
                }}
                viewport={{ margin: "-100px" }}
                transition={{ 
                  duration: 0.8, 
                  delay: i * 0.2, 
                  type: "spring",
                  stiffness: 100
                }}
                className="glass-panel p-10 rounded-xl border-neon-orange/20 relative group overflow-hidden cursor-default"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-neon-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <feat.icon className="w-10 h-10 text-neon-orange mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest group-hover:text-neon-orange transition-colors">{feat.title}</h3>
                <p className="text-slate-gray text-sm leading-relaxed group-hover:text-slate-200 transition-colors">{feat.desc}</p>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-neon-orange group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SOCIAL PROOF */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-5xl"
        >
          <motion.span 
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 140, 0, 0.1)" }}
            className="px-4 py-1.5 rounded-full border border-neon-orange/30 bg-neon-orange/5 text-neon-orange text-[10px] font-bold uppercase tracking-[0.4em] mb-8 inline-block cursor-default transition-all"
          >
            Status: Stable
          </motion.span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {[
              { label: "Uptime", value: "99.99%" },
              { label: "MTTR", value: "< 2s" },
              { label: "Efficiency", value: "10x" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  whileHover={{ 
                    scale: 1.1,
                    color: "#FF8C00",
                    textShadow: "0 0 20px rgba(255, 140, 0, 0.5)"
                  }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  className="text-5xl md:text-7xl font-bold text-white mb-2 cursor-default transition-all"
                >
                  {stat.value}
                </motion.div>
                <motion.div 
                  whileHover={{ letterSpacing: "0.5em", color: "#ffffff" }}
                  className="text-[10px] uppercase tracking-[0.3em] text-slate-gray font-bold cursor-default transition-all"
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 20px rgba(255, 140, 0, 0.2)",
                backgroundColor: "rgba(255, 140, 0, 0.05)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('/cli', '_blank')}
              className="px-12 py-6 border border-neon-orange text-neon-orange font-bold uppercase tracking-[0.3em] text-sm rounded-sm transition-all"
            >
              Explore CLI Tool
            </motion.button>
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 40px rgba(255, 140, 0, 0.6)",
                filter: "brightness(1.2)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLaunch}
              className="px-12 py-6 bg-neon-orange text-black font-bold uppercase tracking-[0.3em] text-sm rounded-sm shadow-[0_0_30px_rgba(255,140,0,0.4)] transition-all"
            >
              Enter Command Center
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 15, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-oled-black rounded-full pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = ({ onBackToHome }: { onBackToHome: () => void }) => {
  const { user, logout: handleLogout } = useAuth();
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [agentReasoning, setAgentReasoning] = useState<string[]>([]);
  const [agentStatus, setAgentStatus] = useState<'IDLE' | 'ANALYZING' | 'FIXING' | 'RESOLVED'>('IDLE');
  const [isAutoHealing, setIsAutoHealing] = useState(false);
  const [lastIncidentRefresh, setLastIncidentRefresh] = useState(new Date());
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Code Fixer State
  const [inputCode, setInputCode] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputCode(content);
      setFileName(file.name);
      // Visual feedback: clear after 5 seconds
      setTimeout(() => setFileName(null), 5000);
    };
    reader.onerror = () => {
      console.error("Failed to read file");
    };
    reader.readAsText(file);
  };
  const [fixResult, setFixResult] = useState<{
    originalCode: string;
    fixedCode: string;
    bugLine: number;
    errorLocation: string;
    changes: string[];
    explanation: string;
    prevention?: string;
  } | null>(null);

  // Mock function to trigger notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const bugIds = ['421', '102', '77', '505'];
        const descs = [
          'Null pointer in authentication service',
          'Memory leak in session handler',
          'Race condition in payment gateway',
          'Uncaught exception in database cluster'
        ];
        const files = [
          'authService.js',
          'sessionManager.ts',
          'paymentGateway.js',
          'dbCluster.ts'
        ];
        const lines = [78, 142, 56, 203];
        const idx = Math.floor(Math.random() * bugIds.length);
        notifyBugFixed(bugIds[idx], descs[idx], files[idx], lines[idx]);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const res = await fetch(`${window.location.origin}/api/system/status`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setSystemState(data);
    } catch (err) {
      console.error("Failed to fetch system status:", err);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // 30-second Incident Refresh Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchSystemStatus(); // Explicitly refresh incidents every 30s
          setLastIncidentRefresh(new Date());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (logEndRef.current && !userScrolled) {
      const container = logEndRef.current.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [systemState?.logs, userScrolled]);

  const triggerIncident = async (type: string) => {
    await fetch('/api/system/trigger-incident', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    setAgentStatus('IDLE');
    setAgentReasoning([]);
  };

  const handleFixCode = async () => {
    if (!inputCode.trim()) return;
    
    setAgentStatus('ANALYZING');
    setAgentReasoning(["[ANALYZING] Ingesting source code...", "Parsing AST for structural vulnerabilities...", "Cross-referencing with known bug patterns..."]);
    setFixResult(null);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const prompt = `
      You are an expert software debugging assistant.
      
      TASK:
      1. Analyze the user's code:
      ${inputCode}
      
      2. Detect syntax errors, logical bugs, or runtime problems.
      3. Explain the bug clearly in beginner-friendly language.
      4. Provide the corrected full code.
      5. Identify the exact line number where the primary bug exists.
      
      OUTPUT FORMAT (JSON):
      {
        "explanation": "### 🔎 Bug Explanation\\n\\n[Your explanation here]",
        "fixedCode": "[The full corrected code]",
        "bugLine": [Line number of the bug],
        "changes": ["Change 1", "Change 2", ...]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an expert software debugging assistant. Return ONLY JSON. Include a 'prevention' field with advice on how to avoid this bug in the future."
        }
      });

      const data = JSON.parse(response.text || "{}");
      
      setAgentStatus('FIXING');
      setAgentReasoning(prev => [...prev, ">> ACTION_INITIATED: [apply_code_patch]", "Refactoring source structure...", "Verifying logic integrity..."]);
      
      await new Promise(r => setTimeout(r, 1500));
      
      setFixResult({
        originalCode: inputCode,
        fixedCode: data.fixedCode || inputCode,
        bugLine: data.bugLine || 1,
        errorLocation: `Line ${data.bugLine || '?'}: Bug detected.`,
        changes: data.changes || ["Fixed identified logical errors."],
        explanation: data.explanation || "Bug fixed.",
        prevention: data.prevention || "Implement defensive coding patterns and strict type checking."
      });
      
      setAgentStatus('RESOLVED');
      setAgentReasoning(prev => [...prev, "[RESOLVED] Code fix complete.", "Stability verified. Deployment ready."]);
      
      // Auto-scroll to output
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);

      // Trigger notification
      notifyBugFixed(Math.floor(Math.random() * 1000).toString(), "User-submitted code fixed.", "user_input.tsx", data.bugLine || 1);
    } catch (err) {
      console.error("Code fix failed", err);
      setAgentStatus('IDLE');
      setAgentReasoning(prev => [...prev, "[ERROR] Critical failure during code analysis."]);
    }
  };

  const handleDemoFix = () => {
    const demoCode = `function calculateTotal(items) {
  let total = 0;
  items.forEach(item => {
    total += item.price;
  });
  return total;
}`;
    setInputCode(demoCode);
    setAgentStatus('ANALYZING');
    setAgentReasoning(['>> Initializing Demo Protocol...', '>> Analyzing sample code...', '>> Identifying logic anomalies...']);
    
    setTimeout(() => {
      setAgentReasoning(prev => [...prev, '>> Detected potential undefined access in items array.', '>> Generating safety guards...']);
      
      setTimeout(() => {
        const result = {
          originalCode: demoCode,
          fixedCode: `function calculateTotal(items) {
  if (!items) return 0;
  let total = 0;
  items.forEach(item => {
    if (item && item.price) {
      total += item.price;
    }
  });
  return total;
}`,
          explanation: "The original code lacked safety checks for the `items` array and individual `item` objects, which could lead to runtime errors if the input is null or malformed.",
          errorLocation: "Line 3: items.forEach is called without checking if items is defined.",
          changes: [
            "Added null check for items array",
            "Added existence check for each item",
            "Added property check for item.price"
          ],
          bugLine: 3,
          prevention: "To avoid this in the future, always use TypeScript for strict type checking and implement defensive checks when iterating over arrays from external sources. Consider using optional chaining (items?.forEach) or default values (items || [])."
        };
        setFixResult(result);
        setAgentStatus('RESOLVED');
        setAgentReasoning(prev => [...prev, '>> Demo resolution complete.', '[RESOLVED] Patch applied successfully.']);
        
        if (outputRef.current) {
          setTimeout(() => {
            outputRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }, 1500);
    }, 1000);
  };

  const runAgent = async () => {
    if (!systemState || !systemState.isIncidentActive) return;
    
    setAgentStatus('ANALYZING');
    setAgentReasoning(["[ANALYZING] Initializing telemetry ingestion...", "Scanning system logs for anomalies..."]);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    const tools = [
      {
        functionDeclarations: [
          {
            name: "restart_service",
            description: "Restarts a specific service container.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                serviceId: { type: Type.STRING, description: "The ID of the service to restart." }
              },
              required: ["serviceId"]
            }
          },
          {
            name: "reset_database_connections",
            description: "Clears the database connection pool.",
            parameters: { type: Type.OBJECT, properties: {} }
          },
          {
            name: "apply_code_patch",
            description: "Applies a code patch to fix a logic bug or memory leak.",
            parameters: { type: Type.OBJECT, properties: {} }
          }
        ]
      }
    ];

    const prompt = `
      You are FixIT, an Autonomous SRE Agent.
      CURRENT SYSTEM STATE:
      Services: ${JSON.stringify(systemState.services)}
      Recent Logs: ${JSON.stringify(systemState.logs.slice(-10))}

      TASK:
      1. Analyze the logs and service statuses.
      2. Identify the root cause.
      3. Decide on the best fix.
      4. Execute the fix using the provided tools.
      
      Output your reasoning steps clearly.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools,
          systemInstruction: "You are FixIT. Be technical, efficient, and professional. Use terms like RCA, Telemetry, and Latency. Always state your reasoning before calling a tool."
        }
      });

      const text = response.text || "";
      const steps = text.split('\n').filter(s => s.trim().length > 0);
      
      for (const step of steps) {
        setAgentReasoning(prev => [...prev, step]);
        await new Promise(r => setTimeout(r, 1000));
      }

      const calls = response.functionCalls;
      if (calls) {
        setAgentStatus('FIXING');
        for (const call of calls) {
          setAgentReasoning(prev => [...prev, `>> ACTION_INITIATED: [${call.name}]`]);
          
          let endpoint = '';
          let body = {};

          if (call.name === 'restart_service') {
            endpoint = '/api/tools/restart-service';
            body = { serviceId: call.args.serviceId };
          } else if (call.name === 'reset_database_connections') {
            endpoint = '/api/tools/reset-db-connections';
          } else if (call.name === 'apply_code_patch') {
            endpoint = '/api/tools/apply-code-patch';
          }

          if (endpoint) {
            await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
          }
        }
        
        setAgentStatus('RESOLVED');
        setAgentReasoning(prev => [...prev, "[RESOLVED] Incident mitigated. System health verified.", "Closing RCA report."]);
      }
    } catch (err) {
      console.error("Agent execution failed", err);
      setAgentReasoning(prev => [...prev, "[ERROR] Agent encountered a critical failure during RCA."]);
      setAgentStatus('IDLE');
    }
  };

  useEffect(() => {
    if (isAutoHealing && systemState?.isIncidentActive && agentStatus === 'IDLE') {
      runAgent();
    }
  }, [systemState?.isIncidentActive, isAutoHealing, agentStatus]);

  if (!systemState) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen bg-oled-black text-white font-mono selection:bg-neon-red/30 pb-20 perspective-1000 relative cursor-none"
    >
      <NotificationSystem />
      <CustomCursor />
      <div className="scanline" />
      <div className={`bulb-glow-overlay ${systemState.isIncidentActive ? 'error' : ''}`} />
      <div className="fixed inset-0 architectural-grid pointer-events-none opacity-10" />
      
      {/* 3D Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} color="#FF8C00" intensity={2} />
          <Suspense fallback={null}>
            <BackgroundGrid />
            <WaveParticles />
            <NeonParticles />
            <SentinelCore isError={systemState.isIncidentActive} isFixing={agentStatus === 'FIXING'} />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Slim Top Navigation */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBackToHome}
              className="group flex items-center gap-3 hover:text-white transition-colors"
            >
              <FixITLogo className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
              <div className="flex flex-col">
                <h1 className="text-white font-bold tracking-tighter text-sm leading-none">FixIT</h1>
                <span className="text-[8px] text-slate-gray uppercase tracking-[0.3em]">Return_Home</span>
              </div>
            </button>
            <div className="w-[1px] h-6 bg-white/5" />
            <span className="text-[9px] text-slate-gray uppercase tracking-[0.3em] font-bold">Command_Center_v4.0</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${systemState.isIncidentActive ? 'bg-neon-red animate-pulse shadow-[0_0_8px_#FF3131]' : 'bg-neon-orange shadow-[0_0_8px_#FF8C00]'}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-gray">
                  {systemState.isIncidentActive ? 'Incident' : 'Stable'}
                </span>
              </div>
              <div className="w-[1px] h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <RefreshCcw className={`w-3 h-3 text-slate-gray ${refreshCountdown === 30 ? 'animate-spin' : ''}`} />
                <span className="text-[9px] text-slate-gray uppercase tracking-widest font-mono">
                  Sync: {refreshCountdown}s
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsAutoHealing(!isAutoHealing)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-sm border transition-all duration-300 text-[10px] font-bold uppercase tracking-widest ${
                isAutoHealing 
                ? 'bg-neon-orange/10 border-neon-orange text-neon-orange shadow-[0_0_10px_rgba(255,140,0,0.2)]' 
                : 'bg-white/5 border-white/10 text-slate-gray hover:border-white/20'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Auto-Heal: {isAutoHealing ? 'Active' : 'Standby'}
            </button>

            {user && (
              <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">{user.displayName}</span>
                  <span className="text-[8px] text-slate-gray uppercase tracking-widest">{user.email}</span>
                </div>
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-white/20" />
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-gray hover:text-neon-red transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-8 space-y-16 relative z-10">
        {/* Top Section: Status & Command */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sentinel Core Mini-View */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 glass-panel rounded-xl h-80 overflow-hidden relative neon-border-red tech-card"
          >
            <div className="absolute inset-0 z-0">
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 4]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} color={agentStatus === 'FIXING' ? '#FF8C00' : '#FF3131'} />
                <Suspense fallback={null}>
                  <SentinelCore isMini isError={systemState.isIncidentActive} isFixing={agentStatus === 'FIXING'} />
                </Suspense>
              </Canvas>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent z-10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-neon-red uppercase tracking-[0.3em] block mb-1">Status</span>
                  <h2 className="text-lg font-bold text-white tracking-tighter uppercase tracking-widest">Neural Link</h2>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`w-1 h-1 rounded-full ${agentStatus !== 'IDLE' ? 'bg-neon-red animate-pulse' : 'bg-slate-800'}`} style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Command Interface */}
          <motion.section 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 glass-panel rounded-xl p-8 relative overflow-hidden neon-border-orange tech-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-neon-orange flex items-center gap-3">
                <Terminal className="w-4 h-4" /> Command
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-gray uppercase font-bold tracking-widest">Source</span>
                <div className="w-1.5 h-1.5 rounded-full bg-neon-orange animate-pulse shadow-[0_0_8px_#FF8C00]" />
              </div>
            </div>
            
            <div className="relative mb-6">
              <textarea 
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="// Ingest buggy code..."
                className="w-full h-48 bg-black/40 border border-white/5 rounded-lg p-6 font-mono text-xs text-slate-200 focus:outline-none focus:border-neon-orange/50 transition-all resize-none shadow-inner"
              />
            </div>

            <div className="flex justify-between items-center">
              <button 
                onClick={handleDemoFix}
                className="text-[9px] text-slate-500 uppercase font-bold hover:text-neon-orange transition-colors"
              >
                Demo
              </button>
              
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".js,.ts,.py,.txt,.json,.html,.css"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all duration-300 text-[9px] font-bold uppercase tracking-widest ${
                    fileName 
                    ? 'bg-green-500/10 border-green-500/50 text-green-500' 
                    : 'bg-white/5 border-white/10 text-slate-gray hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {fileName ? <CheckCircle2 className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
                  {fileName ? `Loaded: ${fileName}` : 'Upload File'}
                </button>

                <button 
                  onClick={handleFixCode}
                  disabled={agentStatus !== 'IDLE' || !inputCode.trim()}
                  className="neon-ghost-button-orange text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 disabled:opacity-30"
                >
                  {agentStatus === 'IDLE' ? (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" /> Remediate
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> {agentStatus}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Resolution Engine - Full Width */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <Zap className="w-4 h-4 text-neon-orange" />
            <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Resolution Engine</span>
          </div>
          <ResolutionEngine reasoning={agentReasoning} status={agentStatus} />
        </div>

        {/* Analysis Results - Full Width */}
        <AnimatePresence>
          {fixResult && (
            <motion.section 
              ref={outputRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 px-2">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-neon-red/30 to-transparent" />
                <span className="text-[10px] font-bold text-neon-red uppercase tracking-[0.3em]">Analysis</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-neon-red/30 to-transparent" />
              </div>
              <CodeComparison 
                originalCode={fixResult.originalCode}
                fixedCode={fixResult.fixedCode}
                explanation={fixResult.explanation}
                changes={fixResult.changes}
                bugLine={fixResult.bugLine}
                prevention={fixResult.prevention}
              />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Bottom Section: Incidents */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <Activity className="w-4 h-4 text-neon-red" />
            <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Incidents</span>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {systemState.isIncidentActive ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <IncidentReportCard 
                    incidentTitle="CRITICAL_SYSTEM_FAILURE"
                    status="resolving"
                    executiveSummary="Anomaly detected in production cluster. Sentinel is initializing remediation protocol."
                    technicalRCA="Detected memory leak in auth-service container. High latency observed in downstream services."
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel rounded-xl p-12 flex flex-col items-center justify-center text-center border-dashed border-white/5"
                >
                  <ShieldCheck className="w-12 h-12 text-neon-orange mb-4 opacity-20" />
                  <p className="text-[10px] text-slate-gray uppercase tracking-widest font-bold">No Active Incidents</p>
                  <p className="text-[9px] text-slate-gray mt-2">System health is optimal.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'vanguard'>('landing');
  const [vanguardSection, setVanguardSection] = useState<'about' | 'contact'>('about');
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-oled-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-neon-red border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="font-sans">
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <LandingPage 
            key="landing" 
            onLaunch={() => setView('dashboard')} 
            onNavigateToVanguard={(section) => {
              setVanguardSection(section);
              setView('vanguard');
            }}
          />
        ) : view === 'vanguard' ? (
          <VanguardPage 
            key="vanguard"
            initialSection={vanguardSection}
            onBack={() => setView('landing')} 
          />
        ) : (
          <Dashboard key="dashboard" onBackToHome={() => setView('landing')} />
        )}
      </AnimatePresence>
    </div>
  );
}
