import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  serverUrl?: string;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  serverUrl = 'http://localhost:3000',
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`${serverUrl}/api/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // If we get any response (even 401), the server is reachable
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, [serverUrl]);

  if (isConnected === null) {
    return null; // Don't show anything while initial check is happening
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-2 text-xs ${className}`}
      >
        {isChecking ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full"
            />
            <span className="text-slate-500">Checking...</span>
          </>
        ) : isConnected ? (
          <>
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-green-600">Connected to backend</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-red-600">Backend unavailable</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionStatus;