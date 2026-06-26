import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const MemberDashboard: React.FC = () => {
  const { user } = useAuth();

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
            <CheckCircle2 className="text-green-500 h-5 w-5" />
          </div>
          <div className="text-2xl font-bold">Checked In</div>
          <div className="text-sm text-secondary mt-1 flex items-center">
            <Clock className="w-4 h-4 mr-1 inline" /> at 09:15 AM
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-secondary">This Week</h3>
            <Calendar className="text-primary h-5 w-5" />
          </div>
          <div className="text-2xl font-bold">4 / 5 Days</div>
          <div className="text-sm text-secondary mt-1">80% attendance rate</div>
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium">Checked In - Cave Workspace</p>
                <p className="text-sm text-secondary">Verified by QR Scan</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Today</p>
                <p className="text-sm text-secondary">09:15 AM</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
