'use client';
import { useEffect, useState, use } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { createPaymentOrder, verifyPayment } from '@/store/slices/paymentSlice';
import { fetchOrderById } from '@/store/slices/orderSlice';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { CheckCircle, ShieldCheck, IndianRupee } from 'lucide-react';

export default function CheckoutPage({ params }) {
  const { orderId } = use(params);
  const dispatch = useDispatch();
  const router = useRouter();

  const { selected: order, loading: orderLoading } = useSelector(state => state.orders);
  const { rzpOrderData, status, loading: paymentLoading } = useSelector(state => state.payment);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    if (orderId) dispatch(fetchOrderById(orderId));

    return () => { document.body.removeChild(script); };
  }, [dispatch, orderId]);

  const handlePayment = async () => {
    if (!razorpayLoaded) return toast.error('Payment gateway loading, please wait.');

    // 1. Create order on backend
    const res = await dispatch(createPaymentOrder(orderId));
    if (res.meta.requestStatus !== 'fulfilled') return;

    const rzpData = res.payload;

    // 2. Open Razorpay Checkout
    const options = {
      key: rzpData.key,
      amount: rzpData.amount,
      currency: rzpData.currency,
      name: 'KrishiSetu',
      description: `Payment for Order #${orderId.slice(-6)}`,
      order_id: rzpData.razorpayOrderId,
      handler: async function (response) {
        // 3. Verify on backend
        const verifyRes = await dispatch(verifyPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          orderId,
        }));

        if (verifyRes.meta.requestStatus === 'fulfilled') {
          toast.success('Payment successful! Held in secure escrow.');
          setTimeout(() => router.push('/orders'), 2000);
        }
      },
      prefill: {
        name: order?.buyer?.name,
        contact: order?.buyer?.phone,
      },
      theme: { color: '#22c55e' }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      toast.error('Payment failed. Please try again.');
    });
    rzp.open();
  };

  if (orderLoading || !order) return <div className="pt-32 text-center">Loading order...</div>;

  return (
    <div className="min-h-screen pt-24 px-6 max-w-3xl mx-auto pb-12">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Secure Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 h-full">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">Order Summary</h2>
              <div className="space-y-4 mb-8">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div className="flex gap-4">
                      {item.imageUrl && <img src={item.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />}
                      <div>
                        <p className="font-medium text-slate-200">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.quantity.value} {item.quantity.unit} x ₹{item.price.value}</p>
                      </div>
                    </div>
                    <span className="font-semibold">₹{(item.price.value * item.quantity.value).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-800">
                <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>₹{order.totalAmount.toLocaleString()}</span></div>
                <div className="flex justify-between text-slate-400"><span>Platform Fees</span><span>₹{order.platformFee.toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-xl font-bold text-white pt-4">
                  <span>Total Payable</span>
                  <span className="text-green-400">₹{order.netAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Payment Method</h2>
                <Badge label="Test Mode" color="amber" className="bg-amber-500/10 text-amber-400 border-amber-500/20" />
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-green-500/5 border-2 border-green-500/50 flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                      <IndianRupee className="text-green-400" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-100 uppercase tracking-tight">Razorpay</p>
                      <p className="text-xs text-slate-400">Cards, UPI, Netbanking</p>
                    </div>
                  </div>
                  <CheckCircle className="text-green-400" size={24} />
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between opacity-50 cursor-not-allowed grayscale">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                      <ShieldCheck className="text-slate-500" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-400">Bank Transfer</p>
                      <p className="text-xs text-slate-500">Available for verified VIPs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 flex gap-4">
              <ShieldCheck className="text-green-400 shrink-0" size={32} />
              <div>
                <h4 className="font-semibold text-green-400 mb-1">Secure Escrow Protection</h4>
                <p className="text-xs text-green-400/80 leading-relaxed">Your money is held securely and only released to the farmer after you confirm the quality of the delivery.</p>
              </div>
            </div>

            <Button
              fullWidth
              size="xl"
              onClick={handlePayment}
              loading={paymentLoading}
              disabled={status === 'success'}
              className="py-6 shadow-[0_20px_50px_rgba(34,197,94,0.2)]"
            >
              {status === 'success' ? (
                <><CheckCircle size={20} /> Payment Completed</>
              ) : (
                <div className="flex flex-col items-center">
                  <span>Pay ₹{order.netAmount.toLocaleString()}</span>
                  <span className="text-[10px] opacity-70 font-normal">Proceed to Razorpay Checkout</span>
                </div>
              )}
            </Button>
            <p className="text-center text-[10px] text-slate-500 px-4">By clicking pay, you agree to KrishiSetu's terms of service and escrow policies.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
