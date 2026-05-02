'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Package, Search } from 'lucide-react';

export default function ManageOrders() {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);

   const fetchOrders = async () => {
      try {
         const res = await api.get('/orders?limit=50');
         setOrders(res.data.data);
      } catch (err) { toast.error('Failed to load orders'); }
      finally { setLoading(false); }
   };

   useEffect(() => { fetchOrders(); }, []);

   const handleDispute = async (orderId) => {
      try {
         await api.patch(`/orders/${orderId}/status`, { status: 'disputed', note: 'Admin marked as disputed' });
         toast.success('Order marked as disputed flag');
         fetchOrders();
      } catch (err) { toast.error('Update failed'); }
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Orders & Dispute Management</h1>
            <div className="relative">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" placeholder="Search order ID" />
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                     <th className="px-6 py-4 font-medium">Order ID</th>
                     <th className="px-6 py-4 font-medium">Buyer</th>
                     <th className="px-6 py-4 font-medium">Farmer</th>
                     <th className="px-6 py-4 font-medium">Amount</th>
                     <th className="px-6 py-4 font-medium">Status / Escrow</th>
                     <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {loading ? <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Loading orders...</td></tr> :
                     orders.map(o => (
                        <tr key={o._id} className="hover:bg-slate-50/50">
                           <td className="px-6 py-4 font-mono text-slate-600">#{o._id.slice(-6)}</td>
                           <td className="px-6 py-4">{o.buyer?.name}</td>
                           <td className="px-6 py-4">{o.farmer?.name}</td>
                           <td className="px-6 py-4 font-medium">₹{o.netAmount}</td>
                           <td className="px-6 py-4">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium border mr-2 
                           ${o.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                                    o.status === 'disputed' ? 'bg-red-100 text-red-700 border-red-200' :
                                       'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                 {o.status}
                              </span>
                              {o.isPaymentHeld && <span className="text-xs text-blue-600 bg-blue-50 px-1 rounded">Escrow Held</span>}
                           </td>
                           <td className="px-6 py-4">
                              {o.status !== 'disputed' && o.status !== 'delivered' && o.status !== 'cancelled' && (
                                 <button onClick={() => handleDispute(o._id)} className="text-xs text-red-600 hover:text-red-800 font-medium bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors">Mark Disputed</button>
                              )}
                              {o.status === 'disputed' && (
                                 <button className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors">Resolve Dispute</button>
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
