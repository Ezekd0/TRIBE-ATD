import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

interface AttendanceLog {
  id: string;
  date: string;
  time: string;
  method: string;
  status: string;
}

const AttendanceHistory: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('attendance_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('check_in_time', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedLogs = data.map((log) => {
            const dateObj = new Date(log.check_in_time);
            return {
              id: log.id,
              date: dateObj.toISOString(),
              time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              method: log.method,
              status: log.status
            };
          });
          setRecords(formattedLogs);
        }
      } catch (err) {
        console.error('Failed to fetch attendance logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Attendance History</h1>
          <p className="text-sm text-secondary">View your past check-in records</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary" />
          </div>
          <input
            type="date"
            className="w-full bg-background border border-border rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-border/50 text-secondary font-medium">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Check-in Time</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-secondary">
                    Loading records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-secondary">
                    No records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-border/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-secondary">{record.method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'Present' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card list view */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          <div className="p-8 text-center text-secondary bg-card border border-border rounded-xl">
            Loading records...
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-secondary bg-card border border-border rounded-xl">
            No records found.
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-card border border-border p-5 rounded-2xl flex flex-col space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-secondary block text-[10px] uppercase tracking-wider mb-1">Date</span>
                  <span className="font-bold text-white">
                    {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  record.status === 'Present' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {record.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5 text-xs">
                <div>
                  <span className="text-secondary block text-[10px] uppercase tracking-wider mb-1">Check-in Time</span>
                  <span className="font-mono text-white">{record.time}</span>
                </div>
                <div>
                  <span className="text-secondary block text-[10px] uppercase tracking-wider mb-1">Method</span>
                  <span className="text-white capitalize">{record.method}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
