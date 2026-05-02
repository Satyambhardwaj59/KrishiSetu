'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AlertCircle, FileText, IndianRupee } from 'lucide-react';

export default function DisputeHandling() {
   const [disputes, setDisputes] = useState([]);
   const [loading, setLoading] = useState(true);

   const fetchDisputes = async () => {
      try {
         const res = await api.get('/orders?limit=50');
         // Filter out only disputed orders
         const disputedOrders = res.data.data.filter(o => o.status === 'disputed');
         setDisputes(disputedOrders);
      } catch (err) { toast.error('Failed to load disputes'); }
      finally { setLoading(false); }
   };

   useEffect(() => { fetchDisputes(); }, []);

   const resolveDispute = async (orderId, resolution) => {
      try {
         // For instance, status is changed to cancelled (refund buyer) or delivered (release to farmer)
         await api.patch(`/orders/${orderId}/status`, { status: resolution, note: `Dispute resolved administratively.` });
         toast.success(`Dispute resolved. Status updated to ${resolution}.`);
         fetchDisputes();
      } catch (err) {
         toast.error('Failed to resolve dispute');
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Dispute Handling</h1>
               <p className="text-slate-500 mt-1">Review flagged orders and intervene forcefully.</p>
            </div>
         </div>

         {loading ? (
            <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full"></div></div>
         ) : disputes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center text-slate-400">
               <AlertCircle size={48} className="mb-4 opacity-50" />
               <p className="text-lg font-medium text-slate-500">No active disputes</p>
               <p className="text-sm">The platform is currently operating smoothly.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
               {disputes.map(d => (
                  <div key={d._id} className="bg-white border-2 border-red-100 rounded-2xl shadow-sm p-6 overflow-hidden relative flex flex-col">
                     <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>

                     <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-lg font-bold text-slate-900">Order #{d._id.slice(-6)}</h3>
                           <p className="text-sm text-slate-500">Raised on {new Date(d.history.find(h => h.status === 'disputed')?.timestamp || Date.now()).toLocaleDateString()}</p>
                        </div>
                        <div className="px-3 py-1 bg-red-50 text-red-600 rounded font-semibold text-sm flex items-center gap-1.5">
                           <AlertCircle size={16} /> Disputed
                        </div>
                     </div>

                     <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
                        <div>
                           <span className="text-xs text-slate-500 block mb-1">Buyer</span>
                           <span className="font-medium text-slate-800">{d.buyer?.name}</span>
                           <span className="text-xs text-slate-400 block">{d.buyer?.phone}</span>
                        </div>
                        <div>
                           <span className="text-xs text-slate-500 block mb-1">Farmer</span>
                           <span className="font-medium text-slate-800">{d.farmer?.name}</span>
                           <span className="text-xs text-slate-400 block">{d.farmer?.phone}</span>
                        </div>
                     </div>

                     <div className="mb-6 flex-1">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Issue / Note</p>
                        <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg text-sm text-slate-700 italic flex gap-3">
                           <FileText size={16} className="text-red-400 shrink-0 mt-0.5" />
                           <p>{d.history.find(h => h.status === 'disputed')?.note || 'No notes provided by staff.'}</p>
                        </div>
                     </div>

                     <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                        <div className="flex items-center gap-2">
                           <span className="p-2 rounded bg-slate-100 text-slate-500"><IndianRupee size={16} /></span>
                           <div>
                              <span className="text-xs text-slate-500 block">Funds Held</span>
                              <span className="font-bold text-slate-900">₹{d.netAmount}</span>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => resolveDispute(d._id, 'cancelled')} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700 transition-colors">Refund Buyer</button>
                           <button onClick={() => resolveDispute(d._id, 'delivered')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white shadow-sm transition-colors">Release to Farmer</button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
