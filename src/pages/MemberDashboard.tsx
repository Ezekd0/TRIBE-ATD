import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, Clock, Calendar, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

interface AttendanceLog {
  id: string;
  check_in_time: string;
  method: string;
}

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('attendance_logs')
          .select('id, check_in_time, method')
          .eq('user_id', user.id)
          .order('check_in_time', { ascending: false });

        if (error) throw error;
        if (data) {
          setLogs(data);
        }
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  // Calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysLog = logs.find(log => new Date(log.check_in_time) >= today);
  
  // Calculate this week's attendance
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start
  const logsThisWeek = logs.filter(log => new Date(log.check_in_time) >= startOfWeek);
  
  // Max days in week so far (assuming Monday-Friday or 5 day week)
  const daysSoFar = Math.max(1, Math.min(5, today.getDay()));
  const attendanceRate = Math.round((logsThisWeek.length / daysSoFar) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome back, {user?.full_name.split(' ')[0]}</h1>
        <div className="text-sm text-secondary">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-secondary">Today's Status</h3>
            {todaysLog ? (
              <CheckCircle2 className="text-green-500 h-5 w-5" />
            ) : (
              <XCircle className="text-secondary h-5 w-5" />
            )}
          </div>
          <div className="text-2xl font-bold">{todaysLog ? 'Checked In' : 'Not Checked In'}</div>
          {todaysLog && (
            <div className="text-sm text-secondary mt-1 flex items-center">
              <Clock className="w-4 h-4 mr-1 inline" /> at {new Date(todaysLog.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        {/* Attendance Summary */}
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-secondary">This Week</h3>
            <Calendar className="text-primary h-5 w-5" />
          </div>
          <div className="text-2xl font-bold">{logsThisWeek.length} / {daysSoFar} Days</div>
          <div className="text-sm text-secondary mt-1">{loading ? 'Loading...' : `${attendanceRate}% attendance rate`}</div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border p-6 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="font-medium text-secondary mb-2">Quick Actions</h3>
            <p className="text-sm text-secondary">Access your ID or update your profile.</p>
          </div>
          <div className="mt-4 flex space-x-3">
            <Link to="/member/id" className="flex-1 text-center bg-primary text-background px-3 py-2 rounded text-sm font-medium hover:opacity-90">View ID</Link>
            <Link to="/member/profile" className="flex-1 text-center bg-background border border-border px-3 py-2 rounded text-sm font-medium hover:bg-border">Profile</Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-xl mt-8">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="font-bold">Recent Check-ins</h3>
          <Link to="/member/history" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="px-6 py-8 text-center text-secondary">Loading records...</div>
          ) : logs.length === 0 ? (
            <div className="px-6 py-8 text-center text-secondary">No recent check-ins found.</div>
          ) : (
            logs.slice(0, 3).map((log) => (
              <div key={log.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">Checked In - Cave Workspace</p>
                  <p className="text-sm text-secondary">Verified by {log.method}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Date(log.check_in_time).toLocaleDateString() === today.toLocaleDateString() ? 'Today' : new Date(log.check_in_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-secondary">{new Date(log.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
