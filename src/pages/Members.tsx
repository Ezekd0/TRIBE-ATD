import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, ShieldAlert, UserX, UserCheck, Trash2, Eye, History, Shield, CheckCircle, Download, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

type MemberStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

interface Member {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: MemberStatus;
  tribeNumber?: string;
  blockchainHash?: string;
  address?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  role: 'member' | 'admin' | 'super_admin';
}

const Members: React.FC = () => {
  const { user } = useAuth();
  const currentUserRole = user?.role;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  
  const [members, setMembers] = useState<Member[]>([]);

  const fetchUsers = async () => {
    try {
      const data = await api.get('/admin/users');
      // Format backend users to frontend members model if needed
      const formatted = data.map((u: any) => ({
        id: u.id,
        name: u.full_name,
        email: u.email,
        joinDate: u.created_at,
        status: u.status,
        tribeNumber: u.tribe_number,
        blockchainHash: u.blockchain_hash,
        address: u.address,
        emergencyName: u.emergency_contact_name,
        emergencyPhone: u.emergency_contact_phone,
        role: u.role
      }));
      setMembers(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{ type: 'APPROVE' | 'SUSPEND' | 'REACTIVATE' | 'DELETE' | 'PROMOTE' | 'RESET_PASSWORD', member: Member } | null>(null);
  const [viewProfileModal, setViewProfileModal] = useState<Member | null>(null);
  const [showReportDropdown, setShowReportDropdown] = useState(false);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.tribeNumber && member.tribeNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterTab === 'ALL') return matchesSearch;
    return matchesSearch && member.status === filterTab;
  });

  const handleAction = (type: 'APPROVE' | 'SUSPEND' | 'REACTIVATE' | 'DELETE' | 'PROMOTE' | 'RESET_PASSWORD', member: Member) => {
    setShowConfirmModal({ type, member });
    setActiveDropdown(null);
  };

  const confirmAction = async () => {
    if (!showConfirmModal) return;
    const { type, member } = showConfirmModal;

    try {
      if (type === 'DELETE') {
        await api.delete(`/admin/users/${member.id}`);
        setMembers(members.filter(m => m.id !== member.id));
      } else if (type === 'RESET_PASSWORD') {
        alert(`Password reset link sent to ${member.email}`);
      } else {
        let newStatus = member.status;
        let newRole = member.role;
        if (type === 'APPROVE') newStatus = 'ACTIVE';
        if (type === 'SUSPEND') newStatus = 'SUSPENDED';
        if (type === 'REACTIVATE') newStatus = 'ACTIVE';
        if (type === 'PROMOTE') newRole = 'admin';

        await api.put(`/admin/users/${member.id}`, { status: newStatus, role: newRole });
        // Instead of doing complex frontend transforms, just refetch
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      alert('Action failed');
    }
    setShowConfirmModal(null);
  };

  const handleDownloadReport = (type: 'DAILY' | 'WEEKLY' | 'MONTHLY', format: 'PDF' | 'CSV') => {
    alert(`Downloading ${type} Attendance Report as ${format}...`);
    setShowReportDropdown(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter mb-1">Tribe Directory</h1>
          <p className="text-secondary text-sm">Manage access, view secure profiles, and process approvals</p>
        </div>
        
        <div className="relative flex-1 sm:w-80 sm:flex-none">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary" />
          </div>
          <input
            type="text"
            placeholder="Search tribe members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder-white/30 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Filter Tabs */}
        <div className="flex space-x-2 border-b border-white/10 pb-2 overflow-x-auto flex-1">
          {['ALL', 'PENDING', 'ACTIVE', 'SUSPENDED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab as any)}
              className={`px-4 py-2 text-sm font-bold rounded-full whitespace-nowrap transition-all ${
                filterTab === tab 
                  ? 'bg-white text-black' 
                  : 'text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
              {tab === 'PENDING' && members.filter(m => m.status === 'PENDING').length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {members.filter(m => m.status === 'PENDING').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Download Reports Button */}
        <div className="relative">
          <button 
            onClick={() => setShowReportDropdown(!showReportDropdown)}
            className="flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold transition-colors text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Attendance Reports
          </button>
          
          <AnimatePresence>
            {showReportDropdown && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-12 w-64 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 text-left backdrop-blur-2xl"
              >
                <div className="p-2 space-y-1">
                  <div className="px-4 py-2 text-xs font-bold text-secondary uppercase tracking-widest border-b border-white/5 mb-1">Download as PDF</div>
                  <button onClick={() => handleDownloadReport('DAILY', 'PDF')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors">Daily Report</button>
                  <button onClick={() => handleDownloadReport('WEEKLY', 'PDF')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors">Weekly Report</button>
                  <button onClick={() => handleDownloadReport('MONTHLY', 'PDF')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors mb-2">Monthly Report</button>
                  
                  <div className="px-4 py-2 text-xs font-bold text-secondary uppercase tracking-widest border-b border-white/5 mb-1">Download as CSV</div>
                  <button onClick={() => handleDownloadReport('DAILY', 'CSV')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors">Daily CSV</button>
                  <button onClick={() => handleDownloadReport('WEEKLY', 'CSV')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors">Weekly CSV</button>
                  <button onClick={() => handleDownloadReport('MONTHLY', 'CSV')} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors">Monthly CSV</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40 text-[10px] uppercase tracking-widest text-[#B3B3B3] border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold">Member Profile</th>
                <th className="px-6 py-4 font-bold">Tribe Number</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors relative">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-xl border flex items-center justify-center text-white font-bold mr-4 shadow-inner ${
                        member.status === 'PENDING' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-black/50 border-white/10'
                      }`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{member.name}</span>
                        <span className="text-[10px] text-secondary uppercase tracking-widest">{member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.tribeNumber ? (
                      <span className="font-mono text-secondary text-xs bg-black px-2 py-1 rounded border border-white/5">
                        {member.tribeNumber}
                      </span>
                    ) : (
                      <span className="text-secondary text-xs italic">Awaiting Generation</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      member.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      member.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {member.status === 'ACTIVE' ? <UserCheck className="w-3 h-3 mr-1" /> : 
                       member.status === 'PENDING' ? <History className="w-3 h-3 mr-1" /> :
                       <UserX className="w-3 h-3 mr-1" />}
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.role === 'admin' ? (
                       <span className="text-blue-400 text-xs font-bold uppercase tracking-wider flex items-center"><Shield className="w-3 h-3 mr-1"/> Admin</span>
                    ) : (
                       <span className="text-secondary text-xs font-bold uppercase tracking-wider">Member</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                      className="text-secondary hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === member.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-8 top-12 w-56 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 text-left backdrop-blur-2xl"
                        >
                          <div className="p-2 space-y-1">
                            <button onClick={() => { setViewProfileModal(member); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 rounded-xl flex items-center transition-colors">
                              <Eye className="w-4 h-4 mr-3 text-secondary" /> View Secure Profile
                            </button>
                            
                            {member.status === 'PENDING' && (
                               <button onClick={() => handleAction('APPROVE', member)} className="w-full text-left px-4 py-2.5 text-sm text-green-400 hover:bg-green-400/10 rounded-xl flex items-center transition-colors">
                                 <CheckCircle className="w-4 h-4 mr-3" /> Approve Access
                               </button>
                            )}

                            {/* Standard admins cannot modify other admins/super_admins */}
                            {(currentUserRole === 'super_admin' || (member.role !== 'admin' && member.role !== 'super_admin')) && (
                              <>
                                <div className="h-px bg-white/10 my-1 w-full" />
                                
                                {member.status === 'ACTIVE' && member.role !== 'super_admin' && (
                                  <button onClick={() => handleAction('SUSPEND', member)} className="w-full text-left px-4 py-2.5 text-sm text-yellow-400 hover:bg-yellow-400/10 rounded-xl flex items-center transition-colors">
                                    <ShieldAlert className="w-4 h-4 mr-3" /> Suspend User
                                  </button>
                                )}

                                {member.status !== 'PENDING' && (
                                  <button onClick={() => handleAction('RESET_PASSWORD', member)} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 rounded-xl flex items-center transition-colors">
                                    <KeyRound className="w-4 h-4 mr-3 text-secondary" /> Reset Password
                                  </button>
                                )}
                                
                                {member.status === 'SUSPENDED' && (
                                  <button onClick={() => handleAction('REACTIVATE', member)} className="w-full text-left px-4 py-2.5 text-sm text-green-400 hover:bg-green-400/10 rounded-xl flex items-center transition-colors">
                                    <UserCheck className="w-4 h-4 mr-3" /> Reactivate User
                                  </button>
                                )}

                                {currentUserRole === 'super_admin' && member.role === 'member' && member.status === 'ACTIVE' && (
                                  <button onClick={() => handleAction('PROMOTE', member)} className="w-full text-left px-4 py-2.5 text-sm text-blue-400 hover:bg-blue-400/10 rounded-xl flex items-center transition-colors">
                                    <Shield className="w-4 h-4 mr-3" /> Grant Admin Rights
                                  </button>
                                )}

                                {member.role !== 'super_admin' && (
                                  <button onClick={() => handleAction('DELETE', member)} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 rounded-xl flex items-center transition-colors">
                                    <Trash2 className="w-4 h-4 mr-3" /> Permanently Delete
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMembers.length === 0 && (
             <div className="p-12 text-center text-secondary">
               No users found matching your filters.
             </div>
          )}
        </div>
      </div>

      {/* Secure Profile Modal */}
      <AnimatePresence>
         {viewProfileModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-[#111] border border-white/10 p-8 rounded-[2rem] max-w-lg w-full shadow-2xl relative"
             >
                <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest text-secondary flex items-center">
                  <Shield className="w-3 h-3 mr-1 text-blue-500" /> Admin View Only
                </div>
                <div className="flex items-center mb-8 mt-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black mr-4">
                    {viewProfileModal.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{viewProfileModal.name}</h2>
                    <p className="text-secondary">{viewProfileModal.email}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-black border border-white/5 p-4 rounded-xl">
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Secure Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-secondary text-sm block">Residential Address</span>
                        <span className="text-white font-medium">{viewProfileModal.address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl">
                    <h3 className="text-xs font-bold text-red-500/50 uppercase tracking-widest mb-2">Emergency Contact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-secondary text-sm block">Name</span>
                        <span className="text-white font-medium">{viewProfileModal.emergencyName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-secondary text-sm block">Phone</span>
                        <span className="text-white font-medium">{viewProfileModal.emergencyPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {viewProfileModal.blockchainHash && (
                    <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
                      <h3 className="text-xs font-bold text-blue-500/50 uppercase tracking-widest mb-2">Blockchain Record</h3>
                      <div>
                        <span className="text-secondary text-sm block">On-Chain Tx Hash</span>
                        <span className="font-mono text-blue-400 text-sm">{viewProfileModal.blockchainHash}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={() => setViewProfileModal(null)} className="mt-8 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors">
                  Close Profile
                </button>
             </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1A1A1A] border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${
                showConfirmModal.type === 'DELETE' ? 'bg-red-500/20 text-red-500' :
                showConfirmModal.type === 'SUSPEND' ? 'bg-yellow-500/20 text-yellow-500' :
                showConfirmModal.type === 'PROMOTE' ? 'bg-blue-500/20 text-blue-500' :
                showConfirmModal.type === 'RESET_PASSWORD' ? 'bg-white/10 text-white' :
                'bg-green-500/20 text-green-500'
              }`}>
                {showConfirmModal.type === 'DELETE' ? <Trash2 className="w-6 h-6" /> :
                 showConfirmModal.type === 'SUSPEND' ? <ShieldAlert className="w-6 h-6" /> :
                 showConfirmModal.type === 'PROMOTE' ? <Shield className="w-6 h-6" /> :
                 showConfirmModal.type === 'RESET_PASSWORD' ? <KeyRound className="w-6 h-6" /> :
                 <CheckCircle className="w-6 h-6" />}
              </div>
              
              <h2 className="text-xl font-bold mb-2 text-white">
                {showConfirmModal.type === 'DELETE' ? 'Permanently Delete User' :
                 showConfirmModal.type === 'SUSPEND' ? 'Suspend User Access' :
                 showConfirmModal.type === 'PROMOTE' ? 'Grant Admin Privileges' :
                 showConfirmModal.type === 'APPROVE' ? 'Approve Member Access' :
                 showConfirmModal.type === 'RESET_PASSWORD' ? 'Force Password Reset' :
                 'Reactivate User'}
              </h2>
              
              <p className="text-secondary text-sm mb-8 leading-relaxed">
                {showConfirmModal.type === 'DELETE' 
                  ? `Are you absolutely sure you want to permanently delete ${showConfirmModal.member.name}? This action cannot be undone.` 
                  : showConfirmModal.type === 'SUSPEND'
                  ? `You are about to suspend ${showConfirmModal.member.name}. They will immediately lose access.`
                  : showConfirmModal.type === 'PROMOTE'
                  ? `You are about to elevate ${showConfirmModal.member.name} to Admin status. They will have full access to this dashboard.`
                  : showConfirmModal.type === 'APPROVE'
                  ? `Approving ${showConfirmModal.member.name} will generate their Tribe Number and mint their identity onto the blockchain.`
                  : showConfirmModal.type === 'RESET_PASSWORD'
                  ? `You are about to send a password reset link to ${showConfirmModal.member.email}. The user will be required to change their password on next login.`
                  : `You are about to reactivate ${showConfirmModal.member.name}. Their ID card will become valid for entry again.`
                }
              </p>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowConfirmModal(null)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmAction}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm shadow-lg ${
                    showConfirmModal.type === 'DELETE' ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' :
                    showConfirmModal.type === 'SUSPEND' ? 'bg-yellow-500 hover:bg-yellow-600 text-black shadow-yellow-500/20' :
                    showConfirmModal.type === 'PROMOTE' ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20' :
                    showConfirmModal.type === 'RESET_PASSWORD' ? 'bg-white hover:bg-gray-200 text-black shadow-white/20' :
                    'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                  }`}
                >
                  {showConfirmModal.type === 'RESET_PASSWORD' ? 'Send Reset Link' : 'Confirm Action'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Members;
