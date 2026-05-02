'use client';
import { useState, useEffect, use } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchProductById, updateProduct } from '@/store/slices/productSlice';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ImageUpload from '@/components/ui/ImageUpload';
import toast from 'react-hot-toast';

export default function EditProductPage({ params }) {
  const { productId } = use(params);
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { selected: product, loading: loadingProduct } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
     name: '', category: 'cereals', description: '',
     quantityValue: '', quantityUnit: 'kg',
     priceValue: '', priceUnit: 'per kg',
     isOrganic: false,
     quality: 'Grade A'
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = ['cereals', 'pulses', 'oilseeds', 'vegetables', 'fruits', 'spices', 'cotton', 'sugarcane', 'other'];
  const units = ['kg', 'quintal', 'ton', 'litre', 'dozen', 'piece'];

  useEffect(() => {
    dispatch(fetchProductById(productId));
  }, [dispatch, productId]);

  useEffect(() => {
    if (product) {
      const currentUserId = user?._id || user?.id;
      const productFarmerId = product.farmer?._id || product.farmer;
      
      if (user && currentUserId !== productFarmerId && product.farmer) {
        toast.error('You are not authorized to edit this product');
        router.push('/dashboard/farmer');
      }

      setFormData({
         name: product.name || '',
         category: product.category || 'cereals',
         description: product.description || '',
         quantityValue: product.quantity?.value || '',
         quantityUnit: product.quantity?.unit || 'kg',
         priceValue: product.price?.value || '',
         priceUnit: product.price?.unit || 'per kg',
         isOrganic: product.isOrganic || false,
         quality: product.quality || 'Grade A'
      });
      
      // Load existing images for preview
      if (product.images && product.images.length > 0) {
        setImages(product.images.map(img => ({
          url: img.url,
          isExisting: true
        })));
      }
    }
  }, [product, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('category', formData.category);
    fd.append('description', formData.description);
    fd.append('quantity[value]', formData.quantityValue);
    fd.append('quantity[unit]', formData.quantityUnit);
    fd.append('price[value]', formData.priceValue);
    fd.append('price[unit]', formData.priceUnit);
    fd.append('isOrganic', formData.isOrganic);
    fd.append('quality', formData.quality);
    
    // Append actual File objects from the images state (only new images)
    images.forEach((img) => {
      if (img.file) {
        fd.append('images', img.file);
      }
    });
    
    const res = await dispatch(updateProduct({ id: productId, formData: fd }));
    setLoading(false);
    
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Product updated successfully!');
      router.push(`/marketplace/${productId}`);
    } else {
      toast.error('Failed to update product');
    }
  };

  if (loadingProduct || !product) {
    return (
       <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto flex justify-center">
         <div className="animate-spin text-green-500 rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
       </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 max-w-3xl mx-auto pb-12">
      <Card>
        <h1 className="text-2xl font-bold mb-6">Edit Product: {product.name}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
           <Input label="Produce Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Premium Basmati Rice" />
           
           <div>
             <label className="text-sm font-medium text-slate-300 mb-1.5 block">Category *</label>
             <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:border-green-500"
               value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
             >
               {categories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
                <Input label="Available Quantity" type="number" required value={formData.quantityValue} onChange={e => setFormData({...formData, quantityValue: e.target.value})} />
             </div>
             <div>
               <label className="text-sm font-medium text-slate-300 mb-1.5 block">Unit</label>
               <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none"
                 value={formData.quantityUnit} onChange={e => setFormData({...formData, quantityUnit: e.target.value})}
               >
                 {units.map(u => <option key={u} value={u}>{u}</option>)}
               </select>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
                <Input label="Price (₹)" type="number" required value={formData.priceValue} onChange={e => setFormData({...formData, priceValue: e.target.value})} />
             </div>
             <div>
               <label className="text-sm font-medium text-slate-300 mb-1.5 block">Per Unit</label>
               <Input value={formData.priceUnit} onChange={e => setFormData({...formData, priceUnit: e.target.value})} placeholder="e.g. per kg" />
             </div>
           </div>

           <div>
             <label className="text-sm font-medium text-slate-300 mb-1.5 block">Description</label>
             <textarea 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:border-green-500 min-h-[100px]"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
             ></textarea>
           </div>
           
           <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded accent-green-500" checked={formData.isOrganic} onChange={e => setFormData({...formData, isOrganic: e.target.checked})} />
              <span className="text-sm font-medium text-slate-300">This is 100% Organic</span>
           </label>

           <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">Quality / Grade *</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none focus:border-green-500"
                value={formData.quality} 
                onChange={e => setFormData({...formData, quality: e.target.value})}
              >
                <option value="Premium">Premium (Export Quality)</option>
                <option value="Grade A">Grade A (High Quality)</option>
                <option value="Grade B">Grade B (Standard)</option>
                <option value="Average">Average (Industrial/Local)</option>
              </select>
           </div>

           <div>
             <label className="text-sm font-medium text-slate-300 mb-3 block">Product Images (Add new to append)</label>
             <ImageUpload value={images} onChange={setImages} />
           </div>

           <Button type="submit" fullWidth size="lg" loading={loading}>Save Changes</Button>
        </form>
      </Card>
    </div>
  );
}
