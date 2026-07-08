import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar as CalendarIcon, Clock, ChevronDown, FileText, FileSpreadsheet, FileBox, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SessionStatus } from '../types';
import { supabase } from '../services/supabase';

interface AttendanceRecord {
  id: string;
  name: string;
  phone: string;
  memberCode: string;
  checkIn: string;
  method: string;
  status: SessionStatus;
}

const AttendanceRecords: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXITED'>('ALL');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sessions, setSessions] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date ribbon state (7 days)
  const today = new Date();
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - i);
    return d;
  }).reverse();
  const [selectedDate, setSelectedDate] = useState<number>(dates[6].getTime()); // Default to today

  // Fetch attendance logs from Supabase when selectedDate changes
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);

      const selected = new Date(selectedDate);
      const startOfDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate()).toISOString();
      const endOfDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + 1).toISOString();

      const { data, error } = await supabase
        .from('attendance_logs')
        .select('id, check_in_time, method, status, users ( full_name, phone_number, tribe_number )')
        .gte('check_in_time', startOfDay)
        .lt('check_in_time', endOfDay)
        .order('check_in_time', { ascending: false });

      if (error) {
        console.error('Error fetching attendance logs:', error);
        setSessions([]);
      } else {
        const mapped: AttendanceRecord[] = (data ?? []).map((row: any) => ({
          id: row.id,
          name: row.users?.full_name ?? 'Unknown',
          phone: row.users?.phone_number ?? '--',
          memberCode: row.users?.tribe_number ?? '--',
          checkIn: new Date(row.check_in_time).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          method: row.method ?? '--',
          status: 'ACTIVE' as SessionStatus,
        }));
        setSessions(mapped);
      }

      setLoading(false);
    };

    fetchAttendance();
  }, [selectedDate]);

  const filteredSessions = sessions.filter(session => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = session.name.toLowerCase().includes(term) || session.phone.includes(term) || session.memberCode.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'ALL' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = (type: 'CSV' | 'PDF' | 'EXCEL') => {
    // In a real application, this would trigger actual file generation using libraries like jspdf, xlsx, or a backend API.
    alert(`Exporting Daily Attendance Report as ${type}...`);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Daily Logs</h1>
          <p className="text-secondary text-sm">Attendance intelligence and session tracking</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center justify-center bg-white text-black hover:scale-105 active:scale-95 px-5 py-2.5 rounded-full transition-all text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <Download className="w-4 h-4 mr-2" /> Export Report <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          
          <AnimatePresence>
            {showExportMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl"
              >
                <div className="p-2 space-y-1">
                  <button onClick={() => handleExport('PDF')} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 rounded-xl flex items-center transition-colors">
                    <FileText className="w-4 h-4 mr-3 text-red-400" /> Export as PDF
                  </button>
                  <button onClick={() => handleExport('EXCEL')} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 rounded-xl flex items-center transition-colors">
                    <FileSpreadsheet className="w-4 h-4 mr-3 text-green-400" /> Export as Excel
                  </button>
                  <button onClick={() => handleExport('CSV')} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 rounded-xl flex items-center transition-colors">
                    <FileBox className="w-4 h-4 mr-3 text-blue-400" /> Export as CSV
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Date Navigation Ribbon */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-3 flex overflow-x-auto scrollbar-hide space-x-3">
        {dates.map((date, i) => {
          const isSelected = selectedDate === date.getTime();
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = date.getDate();
          const month = date.toLocaleDateString('en-US', { month: 'short' });
          
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date.getTime())}
              className={`flex-shrink-0 flex flex-col items-center justify-center py-3 px-6 rounded-[1.5rem] transition-all min-w-[80px] ${
                isSelected ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105' : 'hover:bg-white/10 text-secondary hover:text-white'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isSelected ? 'opacity-80' : ''}`}>
                {dayName}
              </span>
              <span className="text-xl font-bold leading-none mb-1">{dayNum}</span>
              <span className={`text-[10px] uppercase ${isSelected ? 'opacity-80' : ''}`}>{month}</span>
            </button>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-5 rounded-[2rem] flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
          <input 
            type="text" 
            placeholder="Search by name, phone, or ID number..." 
            className="w-full bg-black/20 border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-white placeholder-white/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-3">
          <select 
            className="bg-black/20 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 text-white appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Inside</option>
            <option value="EXITED">Exited</option>
          </select>
          <button className="flex items-center justify-center bg-white/10 border border-white/10 px-5 py-3 rounded-full hover:bg-white/20 hover:scale-105 active:scale-95 transition-all">
            <Filter className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Session Data Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40 border-b border-white/10 text-[10px] uppercase tracking-widest text-[#B3B3B3]">
              <tr>
                <th className="px-6 py-4 font-medium">Member Identity</th>
                <th className="px-6 py-4 font-medium">ID Number</th>
                <th className="px-6 py-4 font-medium">Check-in Time</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!loading && filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-sm font-bold shrink-0 shadow-inner">
                        {session.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold">{session.name}</div>
                        <div className="text-xs text-secondary font-mono">{session.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-secondary text-xs">
                    {session.memberCode}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-secondary">
                      <Clock className="w-3 h-3 mr-1.5" />
                      <span className="font-mono tabular-nums">{session.checkIn}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-secondary uppercase tracking-wider border border-white/10">
                      {session.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 uppercase tracking-wider border border-green-500/20">
                      Present
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div className="p-12 text-center text-secondary flex flex-col items-center">
              <Loader2 className="w-10 h-10 mb-4 opacity-40 animate-spin" />
              <p>Loading attendance records...</p>
            </div>
          )}

          {!loading && filteredSessions.length === 0 && (
            <div className="p-12 text-center text-secondary flex flex-col items-center">
              <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
              <p>No sessions found for this date or filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecords;
