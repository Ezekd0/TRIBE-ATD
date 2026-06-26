import React from 'react';
import { Search } from 'lucide-react';

const AttendanceHistory: React.FC = () => {
  // Mock data
  const records = [
    { id: 1, date: '2026-06-24', time: '09:15 AM', method: 'QR Scan', status: 'Present' },
    { id: 2, date: '2026-06-23', time: '08:50 AM', method: 'Manual', status: 'Present' },
    { id: 3, date: '2026-06-22', time: '09:05 AM', method: 'QR Scan', status: 'Present' },
    { id: 4, date: '2026-06-21', time: '09:30 AM', method: 'QR Scan', status: 'Present' },
    { id: 5, date: '2026-06-18', time: '-', method: '-', status: 'Absent' },
  ];

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

      <div className="bg-card border border-border rounded-xl overflow-hidden">
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
              {records.map((record) => (
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
              ))}
            </tbody>
          </table>
        </div>
        {records.length === 0 && (
          <div className="p-8 text-center text-secondary">
            No records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
