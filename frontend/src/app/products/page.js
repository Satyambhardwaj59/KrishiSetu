'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchMyListings } from '@/store/slices/productSlice';
import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function MyProductsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { user } = useSelector((state) => state.auth);
  const { myListings, loading } = useSelector((state) => state.products);

  useEffect(() => {
    if (user && user.role !== 'farmer') {
      router.push('/dashboard');
    } else if (user) {
      dispatch(fetchMyListings());
    }
  }, [dispatch, user, router]);

  const columns = [
    { key: 'name', header: 'Product', render: (val, row) => (
      <div className="flex items-center gap-3">
        {row.images?.[0]?.url && <img src={row.images[0].url} className="w-10 h-10 rounded-lg object-cover" alt="" />}
        <span className="font-medium text-white">{val}</span>
      </div>
    )},
    { key: 'category', header: 'Category', render: (val) => <span className="capitalize">{val}</span> },
    { key: 'price', header: 'Price', render: (val) => `₹${val?.value} ${val?.unit}` },
    { key: 'availableStock', header: 'Stock', render: (val, row) => `${val} ${row.quantity?.unit}` },
    { key: 'isAvailable', header: 'Status', render: (val) => (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${val ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
        {val ? 'Active' : 'Hidden'}
      </span>
    )},
    { key: 'actions', header: '', render: (_, row) => (
      <div className="flex items-center gap-3 justify-end">
        <Link href={`/marketplace/${row._id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium">View</Link>
        <Link href={`/products/edit/${row._id}`} className="text-amber-400 hover:text-amber-300 text-sm font-medium">Edit</Link>
      </div>
    )},
  ];

  if (!user || user.role !== 'farmer') {
    return null; // Let the useEffect redirect
  }

  return (
    <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto pb-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Products</h1>
          <p className="text-slate-400 mt-1">Manage all your listed products here.</p>
        </div>
        <Link href="/products/new">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Add New Product
          </Button>
        </Link>
      </div>

      <Card>
        <Table 
          columns={columns} 
          data={myListings} 
          loading={loading} 
          emptyMessage="You haven't listed any products yet. Click 'Add New Product' to get started!" 
        />
      </Card>
    </div>
  );
}
