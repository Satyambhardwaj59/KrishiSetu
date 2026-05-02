'use client';
import { useEffect, useState, use } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, updateOrderStatus } from '@/store/slices/orderSlice';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function OrderDetailsPage({ params }) {
  const { orderId } = use(params);
  const dispatch = useDispatch();
  const { selected: order, loading } = useSelector(state => state.orders);
  const { user } = useSelector(state => state.auth);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  const handleUpdate = async (status) => {
    setStatusLoading(true);
    const res = await dispatch(updateOrderStatus({ id: orderId, status }));
    setStatusLoading(false);
    if (res.meta.requestStatus === 'fulfilled') toast.success(`Order marked as ${status}`);
    else toast.error(res.payload?.message || 'Update failed');
  };

  if (loading || !order) return <div className="pt-32 text-center text-green-500"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div></div>;

  const isFarmer = user?.role === 'farmer';
  const isBuyer = user?.role === 'buyer';

  return (
    <div className="min-h-screen pt-24 px-6 max-w-4xl mx-auto pb-12">
      <Link href="/orders" className="text-sm text-green-400 hover:text-green-300 mb-6 inline-block">← Back to Orders</Link>
      
      <div className="flex justify-between items-start mb-8">
         <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">Order #{order._id.slice(-6)} <Badge status={order.status} /></h1>
            <p className="text-slate-400 mt-2">Placed on {new Date(order.createdAt).toLocaleString()}</p>
         </div>
          {isBuyer && order.status === 'accepted' && !order.isPaymentHeld && (
            <div className="flex flex-col items-end gap-2">
              <Link href={`/checkout/${order._id}`}>
                <Button variant="amber" size="lg" className="animate-pulse shadow-[0_10px_30px_rgba(245,158,11,0.3)] px-8 py-4 font-bold">
                  Pay Online Now
                </Button>
              </Link>
              <p className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">Secured via Escrow</p>
            </div>
          )}
          {isBuyer && order.status === 'pending' && (
            <div className="flex flex-col items-end gap-2 opacity-80">
              <Link href={`/checkout/${order._id}`}>
                <Button variant="secondary" size="md">
                  Pre-pay & Secure Order
                </Button>
              </Link>
              <p className="text-[10px] text-slate-500 font-medium text-right">Payment will be held until farmer accepts</p>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <Card className="md:col-span-2 space-y-4">
            <h3 className="font-semibold text-lg border-b border-slate-700 pb-3">Items</h3>
            <div className="space-y-4">
               {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                     <div className="flex gap-4 items-center">
                        <img src={item.imageUrl || '/placeholder-crop.jpg'} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                           <p className="font-medium">{item.name}</p>
                           <p className="text-sm text-slate-400">₹{item.price.value} x {item.quantity.value} {item.quantity.unit}</p>
                        </div>
                     </div>
                     <span className="font-bold">₹{(item.price.value * item.quantity.value).toLocaleString()}</span>
                  </div>
               ))}
            </div>
            
            <div className="border-t border-slate-700 pt-4 mt-6">
              <div className="flex justify-between text-slate-400 mb-2"><span>Subtotal</span> <span>₹{order.totalAmount}</span></div>
              <div className="flex justify-between text-slate-400 mb-2"><span>Platform Fee</span> <span>₹{order.platformFee}</span></div>
              <div className="flex justify-between font-bold text-xl text-green-400 mt-2 pt-2 border-t border-slate-700"><span>Total</span> <span>₹{order.netAmount}</span></div>
            </div>
         </Card>

         <div className="space-y-6">
           <Card>
              <h3 className="font-semibold text-lg border-b border-slate-700 pb-3 mb-4">Delivery details</h3>
              <p className="text-slate-300 whitespace-pre-line">{order.deliveryAddress?.address}</p>
              <p className="text-slate-400 mt-2 text-sm">{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
           </Card>

           <Card>
              <h3 className="font-semibold text-lg border-b border-slate-700 pb-3 mb-4">Contact</h3>
              <p className="text-sm mb-1"><span className="text-slate-400">Role:</span> {isFarmer ? 'Buyer' : 'Farmer'}</p>
              <p className="text-sm font-medium mb-3">{isFarmer ? order.buyer?.name : order.farmer?.name}</p>
              <Link href={`/chat?user=${isFarmer ? order.buyer?._id : order.farmer?._id}`}>
                <Button fullWidth size="sm" variant="outline">Chat now</Button>
              </Link>
           </Card>
           
           <Card className={order.isPaymentHeld ? 'border-green-500/50 bg-green-500/10' : ''}>
              <h3 className="font-semibold text-lg border-b border-slate-700 pb-3 mb-4">Payment</h3>
              <div className="flex items-center gap-2 mb-2">
                 <Badge status={order.isPaymentHeld ? 'paid' : 'pending'} label={order.isPaymentHeld ? 'Escrow Held' : 'Unpaid'} />
                 {order.isPaymentReleased && <Badge status="released" label="Released to Farmer" />}
              </div>
           </Card>
         </div>
      </div>

      {/* Actions based on role and status */}
      <Card glass className="flex justify-end gap-4 p-4 border-t-0 rounded-t-none border-x-0 border-b-0 bg-slate-900 shadow-2xl sticky bottom-0">
         {isFarmer && order.status === 'pending' && (
           <>
             <Button variant="danger"  onClick={() => handleUpdate('rejected')} loading={statusLoading}>Reject Order</Button>
             <Button variant="primary" onClick={() => handleUpdate('accepted')} loading={statusLoading}>Accept Order</Button>
           </>
         )}
         {isFarmer && order.status === 'accepted' && order.isPaymentHeld && (
             <Button variant="primary" onClick={() => handleUpdate('shipped')} loading={statusLoading}>Mark as Shipped</Button>
         )}
         {isBuyer && order.status === 'shipped' && order.isPaymentHeld && (
             <Button variant="primary" onClick={() => handleUpdate('delivered')} loading={statusLoading}>Confirm Delivery (Release Escrow)</Button>
         )}
         {isBuyer && order.status === 'pending' && (
             <Button variant="danger" onClick={() => handleUpdate('cancelled')} loading={statusLoading}>Cancel Request</Button>
         )}
      </Card>
    </div>
  );
}
