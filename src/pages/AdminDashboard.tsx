import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { supabase } from '../services/supabase';

interface DashboardMetrics {
  totalUsers: number;
  activeAccounts: number;
  suspended: number;
  todaysCheckIns: number;
  recentActivity: any[];
  auditLogs: any[];
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    activeAccounts: 0,
    suspended: 0,
    todaysCheckIns: 0,
    recentActivity: [],
    auditLogs: []
  });

  const [loading, setLoading] = useState(true);

  // Still keeping the mock graph for visual purposes until there's enough daily data
  const weeklyData = [
    { name: 'Mon', sessions: 0 },
    { name: 'Tue', sessions: 0 },
    { name: 'Wed', sessions: 0 },
    { name: 'Thu', sessions: 0 },
    { name: 'Fri', sessions: 0 },
    { name: 'Sat', sessions: 0 },
    { name: 'Sun', sessions: 0 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch user stats
        const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: activeAccounts } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE');
        const { count: suspended } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'SUSPENDED');

        // Fetch today's check-ins
        const { count: todaysCheckIns } = await supabase
          .from('attendance_logs')
          .select('*', { count: 'exact', head: true })
          .gte('check_in_time', today.toISOString());

        // Fetch recent check-ins
        const { data: recentActivity } = await supabase
          .from('attendance_logs')
          .select('id, check_in_time, method, status, users ( full_name )')
          .order('check_in_time', { ascending: false })
          .limit(10);

        // Fetch recent audit logs
        const { data: auditLogs } = await supabase
          .from('audit_logs')
          .select('id, action, target_user_id, performed_by, created_at, metadata')
          .order('created_at', { ascending: false })
          .limit(5);

        setMetrics({
          totalUsers: totalUsers || 0,
          activeAccounts: activeAccounts || 0,
          suspended: suspended || 0,
          todaysCheckIns: todaysCheckIns || 0,
          recentActivity: recentActivity || [],
          auditLogs: auditLogs || []
        });
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time subscription for attendance logs to make the dashboard live!
    const channel = supabase.channel('admin-dashboard')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_logs' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
          { label: '👥 TOTAL USERS', value: loading ? '...' : metrics.totalUsers, color: 'text-white' },
          { label: '✅ ACTIVE ACCOUNTS', value: loading ? '...' : metrics.activeAccounts, color: 'text-green-400' },
          { label: '🚫 SUSPENDED', value: loading ? '...' : metrics.suspended, color: 'text-red-400' },
          { label: '📍 CURRENTLY INSIDE', value: '0', color: 'text-blue-400' },
          { label: "🟢 TODAY'S CHECK-INS", value: loading ? '...' : metrics.todaysCheckIns, color: 'text-green-400' },
          { label: '⚫ EXITED TODAY', value: '0', color: 'text-secondary' },
          { label: '📅 TOTAL THIS WEEK', value: loading ? '...' : metrics.todaysCheckIns, color: 'text-white' },
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
              {metrics.recentActivity.length === 0 && (
                <div className="text-center text-secondary text-sm mt-10">No recent activity</div>
              )}
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
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)] bg-green-500 shadow-green-500/50"></div>
                    <div>
                      <p className="font-bold text-sm text-white">{log.users?.full_name || 'Unknown User'}</p>
                      <p className="text-[10px] text-secondary font-mono tracking-wider">CHECK_IN ({log.method})</p>
                    </div>
                  </div>
                  <div className="text-xs text-[#B3B3B3] font-mono tabular-nums">
                    {new Date(log.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
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
                <th className="px-4 py-3 font-medium">Performed By ID</th>
                <th className="px-4 py-3 font-medium">Target ID</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {metrics.auditLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-secondary">
                    No logs recorded yet.
                  </td>
                </tr>
              )}
              {metrics.auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 font-bold text-white">{log.action}</td>
                  <td className="px-4 py-4 text-secondary text-xs font-mono truncate max-w-[100px]">{log.performed_by}</td>
                  <td className="px-4 py-4 text-blue-300 font-mono text-xs truncate max-w-[100px]">{log.target_user_id || 'System'}</td>
                  <td className="px-4 py-4 text-secondary text-xs">{new Date(log.created_at).toLocaleString()}</td>
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
