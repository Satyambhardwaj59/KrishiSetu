'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { IndianRupee, Search, Filter } from 'lucide-react';

export default function PaymentTracking() {
   const [payments, setPayments] = useState([]);
   const [loading, setLoading] = useState(true);

   // Fallback to fetch orders if there is no dedicated payment analytics route
   const fetchPayments = async () => {
      try {
         const res = await api.get('/orders?limit=50');
         // Extract payment details from orders
         const p = res.data.data
            .filter(o => o.isPaymentHeld) // Only orders that have payments initiated
            .map(o => ({
               id: o._id,
               buyer: o.buyer?.name,
               farmer: o.farmer?.name,
               amount: o.netAmount,
               date: o.createdAt,
               status: o.isPaymentReleased ? 'Released' : 'Held in Escrow',
            }));
         setPayments(p);
      } catch (err) { toast.error('Failed to load payments'); }
      finally { setLoading(false); }
   };

   useEffect(() => { fetchPayments(); }, []);

   const releaseFunds = async (orderId) => {
      try {
         // Manual Admin override to release funds
         await api.patch(`/orders/${orderId}/status`, { status: 'delivered', note: 'Admin forcibly released escrow' });
         toast.success('Funds manually released to farmer!');
         fetchPayments();
      } catch (err) {
         toast.error('Failed to release funds');
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Payment & Escrow Tracking</h1>
            <div className="flex gap-3">
               <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Search Payments..." />
               </div>
               <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Filter size={16} /> Filter
               </button>
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                     <th className="px-6 py-4 font-medium">Order ID</th>
                     <th className="px-6 py-4 font-medium">Buyer</th>
                     <th className="px-6 py-4 font-medium">Farmer</th>
                     <th className="px-6 py-4 font-medium">Amount Holding</th>
                     <th className="px-6 py-4 font-medium">Escrow Status</th>
                     <th className="px-6 py-4 font-medium">Date Initiated</th>
                     <th className="px-6 py-4 font-medium">Overrides</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {loading ? <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400">Loading payments...</td></tr> :
                     payments.length === 0 ? <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-400">No active payments found in escrow.</td></tr> :
                        payments.map(p => (
                           <tr key={p.id} className="hover:bg-slate-50/50">
                              <td className="px-6 py-4 font-mono text-slate-600">#{p.id.slice(-6)}</td>
                              <td className="px-6 py-4 text-slate-700">{p.buyer}</td>
                              <td className="px-6 py-4 text-slate-700">{p.farmer}</td>
                              <td className="px-6 py-4 font-bold text-slate-900">₹{p.amount.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                 <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${p.status === 'Released' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {p.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-slate-500">{new Date(p.date).toLocaleDateString()}</td>
                              <td className="px-6 py-4">
                                 {p.status === 'Held in Escrow' && (
                                    <button onClick={() => releaseFunds(p.id)} className="text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded transition-colors border border-emerald-200">Force Release</button>
                                 )}
                                 {p.status === 'Released' && (
                                    <span className="text-xs text-slate-400 italic">No Action</span>
                                 )}
                              </td>
                           </tr>
                        ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}
