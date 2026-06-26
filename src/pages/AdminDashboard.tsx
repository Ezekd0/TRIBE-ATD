import React from 'react';
import { 
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { useRealTime } from '../contexts/RealTimeContext';

const AdminDashboard: React.FC = () => {
  const { metrics } = useRealTime();

  // Mock Data for the week
  const weeklyData = [
    { name: 'Mon', sessions: 45 },
    { name: 'Tue', sessions: 38 },
    { name: 'Wed', sessions: 52 },
    { name: 'Thu', sessions: 47 },
    { name: 'Fri', sessions: 41 },
    { name: 'Sat', sessions: 32 },
    { name: 'Sun', sessions: 25 },
  ];

  // Mock Audit Logs
  const auditLogs = [
    { id: 1, action: 'User Suspended', user: 'Admin User', target: 'John Doe', time: '10 mins ago', severity: 'high' },
    { id: 2, action: 'Exported Reports', user: 'Admin User', target: 'Monthly CSV', time: '1 hour ago', severity: 'low' },
    { id: 3, action: 'Profile Updated', user: 'System Admin', target: 'Jane Smith', time: '2 hours ago', severity: 'low' },
    { id: 4, action: 'User Reactivated', user: 'System Admin', target: 'Michael Ross', time: '5 hours ago', severity: 'medium' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-white tracking-widest uppercase">Live Connection</span>
        </div>
      </div>

      {/* Top Metrics - Live Glassmorphism Panels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '👥 TOTAL USERS', value: '1,248', color: 'text-white' },
          { label: '✅ ACTIVE ACCOUNTS', value: '1,203', color: 'text-green-400' },
          { label: '🚫 SUSPENDED', value: '45', color: 'text-red-400' },
          { label: '📍 CURRENTLY INSIDE', value: metrics.liveUsers, color: 'text-blue-400' },
          { label: "🟢 TODAY'S CHECK-INS", value: metrics.todaysCheckIns, color: 'text-green-400' },
          { label: '⚫ EXITED TODAY', value: metrics.exitedUsers, color: 'text-secondary' },
          { label: '📅 TOTAL THIS WEEK', value: 312 + metrics.todaysCheckIns, color: 'text-white' },
          { label: '🛡️ SECURITY ALERTS', value: '0', color: 'text-green-500' },
        ].map((metric, i) => (
          <motion.div 
            key={i} 
            layout
            className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 rounded-3xl flex flex-col justify-between"
          >
            <p className="text-[#B3B3B3] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 truncate">{metric.label}</p>
            <motion.p 
              key={metric.value}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-3xl sm:text-4xl font-bold tracking-tighter ${metric.color}`}
            >
              {metric.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 rounded-3xl flex flex-col">
          <h2 className="text-xs font-bold text-[#B3B3B3] uppercase tracking-widest mb-8">Daily History Navigation (This Week)</h2>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#B3B3B3" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis stroke="#B3B3B3" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={30} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', color: '#FFF', borderRadius: '16px' }}
                  itemStyle={{ color: '#FFF' }}
                />
                <Line type="monotone" dataKey="sessions" stroke="#FFFFFF" strokeWidth={3} dot={{ r: 5, fill: '#0B0B0B', stroke: '#FFF', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#FFF' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 rounded-3xl flex flex-col h-[400px] overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xs font-bold text-[#B3B3B3] uppercase tracking-widest">Live Activity Log</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-1 scrollbar-hide">
            <AnimatePresence>
              {metrics.recentActivity.map((log) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 group hover:bg-white/5 rounded-2xl px-3 -mx-3 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${log.action === 'CHECK_IN' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                    <div>
                      <p className="font-bold text-sm text-white">{log.name}</p>
                      <p className="text-[10px] text-secondary font-mono tracking-wider">{log.action}</p>
                    </div>
                  </div>
                  <div className="text-xs text-[#B3B3B3] font-mono tabular-nums">{log.time}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Security Audit Logs */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 rounded-3xl flex flex-col">
        <div className="flex items-center mb-8">
          <ShieldAlert className="w-5 h-5 text-red-400 mr-3" />
          <h2 className="text-xs font-bold text-[#B3B3B3] uppercase tracking-widest">Security & Audit Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-secondary border-b border-white/10">
              <tr>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Performed By</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 font-bold text-white">{log.action}</td>
                  <td className="px-4 py-4 text-secondary">{log.user}</td>
                  <td className="px-4 py-4 text-blue-300 font-mono text-xs">{log.target}</td>
                  <td className="px-4 py-4 text-secondary text-xs">{log.time}</td>
                  <td className="px-4 py-4 text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      log.severity === 'high' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                      log.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                      'bg-green-500/10 text-green-500 border border-green-500/20'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
