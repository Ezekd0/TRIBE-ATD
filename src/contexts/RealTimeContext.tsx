import React, { createContext, useContext, useEffect, useState } from 'react';

// Real-Time System Intelligence Mock Provider

interface RealTimeMetrics {
  liveUsers: number;
  todaysCheckIns: number;
  exitedUsers: number;
  recentActivity: ActivityLog[];
}

interface ActivityLog {
  id: string;
  name: string;
  action: 'CHECK_IN' | 'CHECK_OUT';
  time: string;
}

interface RealTimeContextType {
  metrics: RealTimeMetrics;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

// Generate random mock names
const names = ['Victor Clement', 'Esther James', 'Daniel Ekene', 'Grace Paul', 'Samuel Doe', 'Jane Smith', 'David O.', 'Sarah K.', 'Mike Johnson', 'Anna Lee'];

export const RealTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    liveUsers: 42,
    todaysCheckIns: 58,
    exitedUsers: 16,
    recentActivity: [
      { id: '1', name: 'Victor Clement', action: 'CHECK_IN', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]
  });

  useEffect(() => {
    // This simulates Supabase Realtime subscriptions ticking in
    const interval = setInterval(() => {
      // 30% chance to trigger an event every 3 seconds
      if (Math.random() > 0.7) {
        setMetrics(prev => {
          const isCheckIn = Math.random() > 0.4; // 60% chance it's a checkin
          const name = names[Math.floor(Math.random() * names.length)];
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newLog: ActivityLog = { id: Math.random().toString(), name, action: isCheckIn ? 'CHECK_IN' : 'CHECK_OUT', time };
          
          let newLive = prev.liveUsers;
          let newTodays = prev.todaysCheckIns;
          let newExited = prev.exitedUsers;

          if (isCheckIn) {
            newLive += 1;
            newTodays += 1;
          } else {
            // Only checkout if there are live users
            if (newLive > 0) {
              newLive -= 1;
              newExited += 1;
            } else {
              return prev; // Do nothing
            }
          }

          return {
            liveUsers: newLive,
            todaysCheckIns: newTodays,
            exitedUsers: newExited,
            recentActivity: [newLog, ...prev.recentActivity].slice(0, 10) // Keep last 10
          };
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <RealTimeContext.Provider value={{ metrics }}>
      {children}
    </RealTimeContext.Provider>
  );
};

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};
