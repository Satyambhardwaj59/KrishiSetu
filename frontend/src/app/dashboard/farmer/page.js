'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchOrders } from '@/store/slices/orderSlice';
import { fetchMyListings } from '@/store/slices/productSlice';
import Card, { StatCard } from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { Package, IndianRupee, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function FarmerDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: orders, loading: ordersLoading } = useSelector((state) => state.orders);
  const { myListings, loading: listingsLoading } = useSelector((state) => state.products);
  const router = useRouter();

  useEffect(() => {
    if (user?.role !== 'farmer' && user?.role !== 'admin') {
      router.push('/dashboard'); // fallback
    } else {
      dispatch(fetchOrders({ page: 1, limit: 5 }));
      dispatch(fetchMyListings());
    }
  }, [dispatch, user, router]);

  const orderColumns = [
    { key: '_id', header: 'Order ID', render: (val) => <span className="font-mono text-xs">{val.slice(-6)}</span> },
    { key: 'buyer', header: 'Buyer', render: (val) => val?.name || 'Unknown' },
    { key: 'totalAmount', header: 'Amount', render: (val) => `₹${val}` },
    { key: 'status', header: 'Status', render: (val) => <Badge status={val} /> },
    { key: 'createdAt', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'actions', header: '', render: (_, row) => (
      <Link href={`/orders/${row._id}`} className="text-green-400 hover:text-green-300 text-sm font-medium">Manage</Link>
    )},
  ];

  const productColumns = [
    { key: 'name', header: 'Product', render: (val, row) => (
      <div className="flex items-center gap-3">
        {row.images?.[0]?.url && <img src={row.images[0].url} className="w-8 h-8 rounded-lg object-cover" alt="" />}
        <span className="font-medium text-white">{val}</span>
      </div>
    )},
    { key: 'category', header: 'Category', render: (val) => <span className="capitalize">{val}</span> },
    { key: 'price', header: 'Price', render: (val) => `₹${val.value} ${val.unit}` },
    { key: 'availableStock', header: 'Stock', render: (val, row) => `${val} ${row.quantity?.unit}` },
    { key: 'quality', header: 'Quality', render: (val) => <Badge variant="outline">{val}</Badge> },
    { key: 'isAvailable', header: 'Status', render: (val) => (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${val ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
        {val ? 'Active' : 'Hidden'}
      </span>
    )},
    { key: 'actions', header: '', render: (_, row) => (
      <Link href={`/marketplace/${row._id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium">View</Link>
    )},
  ];

  const totalSales = orders.filter(o => ['delivered', 'paid', 'released'].includes(o.status)).reduce((acc, curr) => acc + curr.netAmount, 0);

  return (
    <div className="min-h-screen pt-24 px-6 max-w-7xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Farmer Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back, {user?.name}. Here's what's happening today.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Revenue (Est)" value={`₹${totalSales.toLocaleString()}`} icon={IndianRupee} color="green" trend={12} />
        <StatCard label="Active Orders" value={orders.filter(o => !['delivered','cancelled','rejected'].includes(o.status)).length} icon={Package} color="blue" />
        <StatCard label="Active Listings" value={myListings.length} icon={TrendingUp} color="amber" />
        <StatCard label="Profile Views" value={myListings.reduce((acc, curr) => acc + (curr.views || 0), 0)} icon={Users} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Orders Table */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Link href="/orders" className="text-sm text-green-400 font-medium hover:text-green-300">View All</Link>
            </div>
            <Table columns={orderColumns} data={orders.slice(0,5)} loading={ordersLoading} emptyMessage="No orders yet" />
          </Card>

          {/* My Listings Table */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">My Active Listings</h2>
              <Link href="/products/new" className="text-sm text-green-400 font-medium hover:text-green-300 flex items-center gap-1">
                <TrendingUp size={14} /> Manage All
              </Link>
            </div>
            <Table columns={productColumns} data={myListings.slice(0, 10)} loading={listingsLoading} emptyMessage="You haven't listed any products yet" />
          </Card>
        </div>

        {/* Sidebar: Quick Actions / KYC Status */}
        <div className="space-y-6">
           <Card glass>
              <h2 className="text-lg font-semibold mb-4">Account Status</h2>
              <div className="flex items-center gap-4 mb-4">
                 <div className={`p-3 rounded-xl ${user?.kycStatus === 'verified' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    🛡️
                 </div>
                 <div>
                    <p className="font-medium text-white tracking-wide uppercase text-sm">KYC {user?.kycStatus}</p>
                    <p className="text-xs text-slate-400">{user?.kycStatus === 'verified' ? 'Your account is fully verified.' : 'Please complete KYC to receive payments.'}</p>
                 </div>
              </div>
              {user?.kycStatus !== 'verified' && (
                <Link href="/kyc"><Button fullWidth size="sm" variant="outline">Complete KYC</Button></Link>
              )}
           </Card>

           <Card>
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                 <Link href="/products/new" className="block"><Button fullWidth variant="primary" className="justify-start">➕ Add New Product</Button></Link>
                 <Link href="/chat" className="block"><Button fullWidth variant="secondary" className="justify-start">💬 Messages</Button></Link>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
