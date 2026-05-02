'use client';
import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Phone, KeySquare } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminLogin() {
  const [phone, setPhone] = useState('9999999990');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { phone, password });
      const user = res.data.data.user;

      if (user.role !== 'admin') {
        toast.error('Access Denied. Admin only.');
        setLoading(false);
        return;
      }

      localStorage.setItem('adminToken', res.data.data.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(user));
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Toaster />
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="KrishiSetu Logo" className="h-16 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Portal</h1>
          <p className="text-slate-500 mt-2">Sign in with your password</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">Phone Number</label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative mt-1">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
