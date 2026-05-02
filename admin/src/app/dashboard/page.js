'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Package, Users, IndianRupee, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, disputes: 0 });
  const [loading, setLoading] = useState(true);

  // Mock chart data
  const revenueData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 8900 },
    { name: 'Sat', revenue: 10390 },
    { name: 'Sun', revenue: 8490 },
  ];

  const userRegistrationData = [
    { name: 'Jan', users: 400 },
    { name: 'Feb', users: 300 },
    { name: 'Mar', users: 550 },
    { name: 'Apr', users: 200 },
    { name: 'May', users: 278 },
    { name: 'Jun', users: 189 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          api.get('/users?limit=1'),
          api.get('/orders?limit=1')
        ]);
        setStats({
          users: usersRes.data.meta?.total || 0,
          orders: ordersRes.data.meta?.total || 0,
          revenue: 1250000,
          disputes: 2
        });
      } catch (err) { } finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Users', value: stats.users.toLocaleString(), icon: Users, color: 'blue' },
    { title: 'Total Orders', value: stats.orders.toLocaleString(), icon: Package, color: 'emerald' },
    { title: 'GMV (INR)', value: `₹${(stats.revenue / 100000).toFixed(2)}L`, icon: IndianRupee, color: 'amber' },
    { title: 'Active Disputes', value: stats.disputes, icon: AlertTriangle, color: 'red' },
  ];

  if (loading) return <div className="h-full flex items-center justify-center"><div className="animate-spin text-blue-500 rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-${c.color}-50 text-${c.color}-600`}>
                <c.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{c.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{c.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-96 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4">Revenue Trend (Past 7 Days)</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} dx={-10} />
                <Tooltip cursor={{ stroke: '#cbd5e1' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-96 flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4">User Registrations (6 Months)</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userRegistrationData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
