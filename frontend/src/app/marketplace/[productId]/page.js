'use client';
import { useEffect, useState, use } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchProductById } from '@/store/slices/productSlice';
import { placeOrder } from '@/store/slices/orderSlice';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { MapPin, ShieldCheck, Truck, Store, IndianRupee, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailsPage({ params }) {
  const { productId } = use(params);
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { selected: product, loading } = useSelector(state => state.products);
  const { user } = useSelector(state => state.auth);
  
  const [orderQty, setOrderQty] = useState(1);
  const [orderUnit, setOrderUnit] = useState('kg');
  const [address, setAddress] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (product) {
       setOrderUnit(product.quantity.unit || 'kg');
    }
  }, [product]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        toast.success('Product deleted successfully');
        router.push('/dashboard/farmer');
      } catch (e) {
        toast.error('Failed to delete product');
      }
    }
  };

  const calculateTotal = () => {
    if (!product) return 0;
    const basePrice = product.price.value;
    const pUnit = (product.price.unit || '').replace('per ', '').trim() || 'kg';
    const sUnit = orderUnit;
    
    let multiplier = 1;
    const weights = { kg: 1, quintal: 100, ton: 1000 };
    if (weights[sUnit] && weights[pUnit]) {
      multiplier = weights[sUnit] / weights[pUnit];
    }
    
    return basePrice * orderQty * multiplier;
  };

  const calculateMaxQty = () => {
    if (!product) return 1;
    const stockUnit = product.quantity.unit || 'kg';
    const sUnit = orderUnit;
    const weights = { kg: 1, quintal: 100, ton: 1000 };
    
    if (weights[stockUnit] && weights[sUnit]) {
      return product.availableStock * (weights[stockUnit] / weights[sUnit]);
    }
    return product.availableStock;
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!user) return router.push('/login');
    if (user.role === 'farmer') return toast.error('Farmers cannot buy products');
    if (!address.trim()) return toast.error('Delivery address is required');
    
    const maxQty = calculateMaxQty();
    if (orderQty < 0.1 || orderQty > maxQty) return toast.error('Invalid quantity selected');

    setPlacingOrder(true);
    const payload = {
      farmerId: product.farmer._id,
      items: [{
        productId: product._id,
        quantity: { value: orderQty, unit: orderUnit },
      }],
      deliveryAddress: {
        address,
        city: 'Pending', state: 'Pending', pincode: '000000' // Stubbed for brevity
      }
    };

    const res = await dispatch(placeOrder(payload));
    setPlacingOrder(false);
    
    if (res.meta.requestStatus === 'fulfilled') {
       toast.success('Order placed successfully!');
       router.push(`/orders/${res.payload._id}`);
    }
  };

  if (loading || !product) {
    return (
       <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto flex justify-center">
         <div className="animate-spin text-green-500 rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
       </div>
    );
  }

  const isOwner = user && user._id === product.farmer?._id;
  const deliveryUnits = ['kg', 'quintal', 'ton', 'litre', 'dozen', 'piece']; 

  return (
    <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto pb-12">
      <Link href="/marketplace" className="text-sm text-green-400 hover:text-green-300 mb-6 inline-block">← Back to Market</Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
         {/* Images */}
         <div className="space-y-4">
           <div className="aspect-square rounded-3xl overflow-hidden bg-slate-900 border border-slate-700 relative">
              <img 
                src={product.images?.[0]?.url || '/placeholder-crop.jpg'} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isOrganic && (
                <Badge label="100% Organic" color="green" className="absolute top-4 right-4 shadow-xl backdrop-blur bg-green-500/90 text-white border-none py-1.5" />
              )}
           </div>
           <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
             {product.images?.slice(1).map((img, i) => (
                <img key={i} src={img.url} className="w-24 h-24 object-cover rounded-xl border border-slate-700 cursor-pointer" alt="thumbnail" />
             ))}
           </div>
         </div>

         {/* Details */}
         <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
               <Badge label={product.category} color="amber" />
               <span className="flex items-center text-sm text-slate-400"><MapPin size={14} className="mr-1"/> {product.farmer?.location?.state || 'Location N/A'}</span>
            </div>

            <div className="text-3xl font-bold text-green-400 mb-6">
              ₹{product.price.value} <span className="text-lg text-slate-400 font-medium">/ {product.price.unit || 'kg'}</span>
            </div>

            <div className="prose prose-invert max-w-none mb-8">
               <p className="text-slate-300 leading-relaxed text-lg">{product.description || 'No description provided.'}</p>
            </div>

            {isOwner && (
              <div className="flex gap-4 mb-8">
                <Link href={`/products/edit/${productId}`} className="flex-1">
                   <Button variant="secondary" fullWidth className="h-12 border-slate-600"><Edit size={16} className="mr-2"/> Edit Listing</Button>
                </Link>
                <Button onClick={handleDelete} className="flex-1 h-12 bg-red-600 hover:bg-red-500 text-white"><Trash2 size={16} className="mr-2"/> Delete Listing</Button>
              </div>
            )}

            <Card glass className="p-6 mb-8 border-slate-700/50 flex flex-col gap-4">
               <h3 className="font-semibold text-white flex items-center gap-2"><Store size={18}/> Sold by</h3>
               <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <div>
                    <p className="font-bold text-lg">{product.farmer?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {product.farmer?.kycStatus === 'verified' && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded flex items-center gap-1"><ShieldCheck size={12}/> Verified Farmer</span>}
                    </div>
                  </div>
                  {user && !isOwner && (
                    <Link href={`/chat?user=${product.farmer?._id}`}>
                       <Button variant="secondary" size="sm">Chat</Button>
                    </Link>
                  )}
               </div>
            </Card>

            {(!isOwner && (!user || user.role === 'buyer')) && (
              <form onSubmit={handleOrder} className="mt-auto bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-2xl">
                 <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><Truck size={20}/> Order Details</h3>
                 
                 <div className="grid grid-cols-2 gap-4 mb-6">
                   <div>
                      <label className="text-sm font-medium text-slate-400 mb-2 block">Quantity & Unit</label>
                      <div className="flex items-center bg-slate-900 rounded-xl border border-slate-600 overflow-hidden">
                         <input 
                           type="number" 
                           step="0.1"
                           min="0.1"
                           max={calculateMaxQty()}
                           value={orderQty}
                           onChange={e => setOrderQty(Number(e.target.value))} 
                           className="w-20 lg:flex-1 h-10 bg-transparent text-center text-white px-2 outline-none" 
                         />
                         <select 
                           value={orderUnit}
                           onChange={e => setOrderUnit(e.target.value)}
                           className="w-20 lg:w-24 h-10 bg-slate-700 border-l border-slate-600 text-white px-2 outline-none text-sm cursor-pointer"
                         >
                           {deliveryUnits.map(u => <option key={u} value={u}>{u}</option>)}
                         </select>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Available: {calculateMaxQty().toFixed(2)} {orderUnit}</p>
                   </div>
                   <div className="flex flex-col justify-end">
                      <div className="bg-slate-900/50 border border-slate-700 p-3 rounded-xl flex justify-between items-center h-20">
                         <span className="text-sm text-slate-400">Total:</span>
                         <span className="text-xl font-bold text-green-400 flex items-center gap-1"><IndianRupee size={18}/>{calculateTotal().toLocaleString()}</span>
                      </div>
                   </div>
                 </div>

                 <div className="mb-6">
                   <Input 
                      label="Delivery Address" 
                      placeholder="Enter full address..." 
                      value={address} 
                      onChange={e => setAddress(e.target.value)}
                      required
                   />
                 </div>

                 <Button 
                    type="submit" 
                    fullWidth 
                    size="xl" 
                    loading={placingOrder}
                    disabled={!product.isAvailable || product.availableStock < 1 || (user && user.role === 'farmer')}
                 >
                   {product.isAvailable ? 'Place Bulk Order' : 'Out of Stock'}
                 </Button>
                 {(!user || user.role === 'farmer') && (
                   <p className="text-xs text-amber-400 text-center mt-3">You must be logged in as a buyer to order.</p>
                 )}
              </form>
            )}
         </div>
      </div>
    </div>
  );
}

