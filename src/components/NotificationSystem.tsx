import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Bug, Clock, MapPin, X } from 'lucide-react';

export interface BugNotification {
  id: string;
  bugId: string | number;
  description: string;
  fileLocation: string;
  lineNumber: number | string;
  timestamp: string;
}

// Global emitter for notifications
type NotificationCallback = (notification: BugNotification) => void;
const listeners: Set<NotificationCallback> = new Set();

export const notifyBugFixed = (bugId: string | number, description: string, fileLocation: string, lineNumber: number | string) => {
  const notification: BugNotification = {
    id: Math.random().toString(36).substr(2, 9),
    bugId,
    description,
    fileLocation,
    lineNumber,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  listeners.forEach(listener => listener(notification));
};

export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<BugNotification[]>([]);

  const addNotification = useCallback((notification: BugNotification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  useEffect(() => {
    listeners.add(addNotification);
    return () => {
      listeners.delete(addNotification);
    };
  }, [addNotification]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto w-full bg-[#0A0A0A] border border-emerald-500/30 rounded-xl shadow-2xl shadow-emerald-500/10 overflow-hidden group"
          >
            <div className="p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Bug className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Bug #{n.bugId} Fixed</span>
                  </div>
                  <button 
                    onClick={() => removeNotification(n.id)}
                    className="text-gray-600 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                <p className="text-xs text-white font-medium mb-2 leading-snug">
                  {n.description}
                </p>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono">
                    <MapPin className="w-2.5 h-2.5" />
                    <span className="truncate">{n.fileLocation} : line {n.lineNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Time: {n.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress bar for auto-dismiss */}
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-0.5 bg-emerald-500/50"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
