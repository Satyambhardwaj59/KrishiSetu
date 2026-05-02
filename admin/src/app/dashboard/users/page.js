'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Eye, Check, X, Shield, Landmark, FileText, ExternalLink, Calendar } from 'lucide-react';

export default function ManageUsers() {
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [selectedUser, setSelectedUser] = useState(null);
   const [rejectReason, setRejectReason] = useState('');
   const [showRejectInput, setShowRejectInput] = useState(false);

   const fetchUsers = async () => {
      try {
         const res = await api.get('/users?limit=50');
         setUsers(res.data.data);
      } catch (err) { toast.error('Failed to load users'); }
      finally { setLoading(false); }
   };

   useEffect(() => { fetchUsers(); }, []);

   const handleKYC = async (userId, status, reason = '') => {
      try {
         await api.patch(`/users/${userId}/kyc-status`, { status, reason });
         toast.success(`KYC marked as ${status}`);
         setSelectedUser(null);
         setShowRejectInput(false);
         setRejectReason('');
         fetchUsers();
      } catch (err) { toast.error('KYC update failed'); }
   };

   const statusColors = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      submitted: 'bg-blue-100 text-blue-700 border-blue-200',
      verified: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">User & KYC Management</h1>
         </div>

         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                     <th className="px-6 py-4 font-medium">Name</th>
                     <th className="px-6 py-4 font-medium">Phone</th>
                     <th className="px-6 py-4 font-medium">Role</th>
                     <th className="px-6 py-4 font-medium">KYC Status</th>
                     <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {loading ? <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Loading...</td></tr> :
                     users.map(u => (
                        <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-500">{u.email || 'No email'}</div>
                           </td>
                           <td className="px-6 py-4 text-slate-600 font-mono">{u.phone}</td>
                           <td className="px-6 py-4 capitalize">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'farmer' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                 {u.role}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[u.kycStatus]}`}>
                                 {u.kycStatus}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              {u.kycStatus === 'submitted' ? (
                                 <button
                                    onClick={() => setSelectedUser(u)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs font-semibold shadow-sm shadow-blue-200"
                                 >
                                    <Eye size={14} /> Review KYC
                                 </button>
                              ) : u.kycStatus === 'verified' ? (
                                 <span className="text-green-600 flex items-center justify-end gap-1 text-xs font-medium">
                                    <Check size={14} /> Verified
                                 </span>
                              ) : (
                                 <span className="text-slate-400 italic text-xs">Waiting</span>
                              )}
                           </td>
                        </tr>
                     ))}
               </tbody>
            </table>
         </div>

         {/* KYC Detail Modal */}
         {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                  {/* Header */}
                  <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-900">Review KYC Submission</h2>
                        <p className="text-slate-500 font-medium">{selectedUser.name} • {selectedUser.phone}</p>
                     </div>
                     <button onClick={() => { setSelectedUser(null); setShowRejectInput(false); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                     </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                     {/* Details Column */}
                     <div className="space-y-8">
                        {/* Identity Section */}
                        <section>
                           <div className="flex items-center gap-2 mb-4 text-blue-600">
                              <Shield size={18} />
                              <h3 className="font-bold uppercase tracking-wider text-xs">Identity Verification</h3>
                           </div>
                           <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                              <div className="flex justify-between items-center">
                                 <span className="text-slate-500 text-xs">ID Type</span>
                                 <span className="font-bold text-slate-900 capitalize">{selectedUser.kycDetails?.idType || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-slate-500 text-xs">ID Number</span>
                                 <span className="font-bold text-slate-900 font-mono tracking-wider">{selectedUser.kycDetails?.idNumber || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                 <span className="text-slate-500 text-xs flex items-center gap-1"><Calendar size={12} /> Submitted</span>
                                 <span className="text-slate-600 text-xs">
                                    {selectedUser.kycDetails?.submittedAt ? new Date(selectedUser.kycDetails.submittedAt).toLocaleDateString() : 'Unknown'}
                                 </span>
                              </div>
                           </div>
                        </section>

                        {/* Banking Section */}
                        <section>
                           <div className="flex items-center gap-2 mb-4 text-green-600">
                              <Landmark size={18} />
                              <h3 className="font-bold uppercase tracking-wider text-xs">Banking Information</h3>
                           </div>
                           <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                              <div>
                                 <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tight">Account Holder</span>
                                 <p className="font-bold text-slate-900">{selectedUser.kycDetails?.accountHolderName || 'N/A'}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tight">Bank Name</span>
                                    <p className="font-bold text-slate-900 text-sm">{selectedUser.kycDetails?.bankName || 'N/A'}</p>
                                 </div>
                                 <div>
                                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tight">IFSC Code</span>
                                    <p className="font-bold text-slate-900 text-sm font-mono tracking-tighter">{selectedUser.kycDetails?.bankIFSC || 'N/A'}</p>
                                 </div>
                              </div>
                              <div className="pt-2 border-t border-slate-200">
                                 <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tight">Account Number (Secure)</span>
                                 <p className="font-bold text-slate-900 tracking-[0.2em]">{selectedUser.kycDetails?.bankAccount ? '••••' + selectedUser.kycDetails.bankAccount.slice(-4) : 'N/A'}</p>
                              </div>
                           </div>
                        </section>
                     </div>

                     {/* Document View Column */}
                     <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2 text-amber-600">
                              <FileText size={18} />
                              <h3 className="font-bold uppercase tracking-wider text-xs">Document Preview</h3>
                           </div>
                           <a href={selectedUser.kycDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[10px] font-bold uppercase transition-colors">
                              Open Full <ExternalLink size={12} />
                           </a>
                        </div>
                        <div className="flex-1 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 relative group cursor-zoom-in min-h-[300px]">
                           {selectedUser.kycDocumentUrl ? (
                              <img
                                 src={selectedUser.kycDocumentUrl}
                                 alt="KYC Proof"
                                 className="w-full h-full object-contain"
                              />
                           ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic text-sm">No document uploaded</div>
                           )}
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="text-white text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">Click to enlarge</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Footer / Actions */}
                  <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50">
                     {showRejectInput ? (
                        <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                           <label className="text-xs font-bold text-slate-500 uppercase">Reason for Rejection</label>
                           <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Explain why the KYC was rejected (e.g. Blurry image, ID number mismatch)..."
                              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all min-h-[80px]"
                           />
                           <div className="flex gap-3">
                              <button onClick={() => handleKYC(selectedUser._id, 'rejected', rejectReason)} disabled={!rejectReason} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-200">Confirm Rejection</button>
                              <button onClick={() => setShowRejectInput(false)} className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-100 transition-all">Cancel</button>
                           </div>
                        </div>
                     ) : (
                        <div className="flex gap-4">
                           <button onClick={() => handleKYC(selectedUser._id, 'verified')} className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                              <Check size={20} /> Approve Submission
                           </button>
                           <button onClick={() => setShowRejectInput(true)} className="flex-1 py-4 bg-white text-red-600 border border-red-200 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                              <X size={20} /> Reject Submission
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}

