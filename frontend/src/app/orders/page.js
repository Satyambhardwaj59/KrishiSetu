'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '@/store/slices/orderSlice';
import Table, { Pagination } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { items, meta, loading } = useSelector(state => state.orders);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handlePageChange = (page) => dispatch(fetchOrders({ page, limit: 10 }));

  const columns = [
    { key: '_id', header: 'Order ID', render: (val) => <span className="font-mono text-xs">{val.slice(-6)}</span> },
    { 
      key: user?.role === 'farmer' ? 'buyer' : 'farmer', 
      header: user?.role === 'farmer' ? 'Buyer Name' : 'Farmer Name', 
      render: (val) => val?.name || '—' 
    },
    { key: 'netAmount', header: 'Amount', render: (val) => `₹${val.toLocaleString()}` },
    { key: 'status', header: 'Status', render: (val) => <Badge status={val} /> },
    { key: 'createdAt', header: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'actions', header: 'Action', render: (_, row) => (
      <Link href={`/orders/${row._id}`} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-200 transition-colors">
        View
      </Link>
    )},
  ];

  return (
    <div className="min-h-screen pt-24 px-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-slate-400 mt-1">Track and manage your {user?.role === 'buyer' ? 'purchases' : 'sales'}.</p>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={items} 
        loading={loading} 
        emptyMessage="No orders found."
      />
      
      {!loading && meta.totalPages > 1 && (
         <div className="mt-6 flex flex-col items-center">
            <span className="text-sm text-slate-400 mb-2">Showing page {meta.page} of {meta.totalPages}</span>
            <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={handlePageChange} />
         </div>
      )}
    </div>
  );
}
