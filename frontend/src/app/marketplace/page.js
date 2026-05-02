'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/store/slices/productSlice';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { Search, Filter, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function MarketplacePage() {
  const dispatch = useDispatch();
  const { items, loading, meta } = useSelector(state => state.products);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 12, q: searchTerm, category }));
  }, [dispatch, searchTerm, category]);

  const categories = ['cereals', 'pulses', 'oilseeds', 'vegetables', 'fruits', 'spices', 'cotton', 'sugarcane', 'other'];

  return (
    <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-slate-400">Find the freshest harvest directly from farmers.</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-4">
          <Input 
            icon={Search} 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          <select 
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:border-green-500 cursor-pointer"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {[1,2,3,4,5,6,7,8].map(i => (
             <Card key={i} className="animate-pulse flex flex-col h-80">
                <div className="h-40 bg-slate-700 rounded-xl mb-4 w-full"></div>
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-auto"></div>
                <div className="h-10 bg-slate-700 rounded w-full mt-4"></div>
             </Card>
           ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/50 rounded-3xl border border-slate-700/50">
          <span className="text-5xl mb-4 block">🌾</span>
          <h3 className="text-xl font-medium mb-2">No products found</h3>
          <p className="text-slate-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((prod) => (
            <Card hover glass padding={false} key={prod._id} className="overflow-hidden flex flex-col">
              <div className="h-48 relative overflow-hidden bg-slate-900">
                <img 
                  src={prod.images?.[0]?.url || '/placeholder-crop.jpg'} 
                  alt={prod.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                {prod.isOrganic && (
                  <Badge label="100% Organic" color="green" className="absolute top-3 right-3 shadow-lg backdrop-blur bg-green-500/80 text-white border-none" />
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-lg font-semibold truncate pr-2">{prod.name}</h3>
                   <span className="font-bold text-green-400 whitespace-nowrap">₹{prod.price.value}/<span className="text-xs text-slate-400">{prod.price.unit || 'kg'}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                  <MapPin size={14} /> 
                  <span className="truncate">{prod.farmer?.location?.state || 'Location N/A'}</span>
                  <span className="mx-1">•</span>
                  <span>{prod.availableStock} {prod.quantity.unit} available</span>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-700/50">
                   <Link href={`/marketplace/${prod._id}`}>
                     <Button fullWidth variant="secondary">View Details</Button>
                   </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
