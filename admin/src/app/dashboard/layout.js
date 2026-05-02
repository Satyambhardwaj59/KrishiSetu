'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Package, AlertCircle, LogOut, IndianRupee } from 'lucide-react';
import '../globals.css';

export default function AdminLayout({ children }) {
   const router = useRouter();
   const pathname = usePathname();
   const [admin, setAdmin] = useState(null);

   useEffect(() => {
      if (typeof window !== 'undefined') {
         const userStr = localStorage.getItem('adminUser');
         const token = localStorage.getItem('adminToken');
         if (!token || !userStr) {
            router.push('/login');
            return;
         }
         const user = JSON.parse(userStr);
         if (user.role !== 'admin') {
            localStorage.removeItem('adminToken');
            router.push('/login');
            return;
         }
         setAdmin(user);
      }
   }, [router]);

   if (!admin) return null;

   const links = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'User & KYC', href: '/dashboard/users', icon: Users },
      { name: 'Orders', href: '/dashboard/orders', icon: Package },
      { name: 'Payments', href: '/dashboard/payments', icon: IndianRupee },
      { name: 'Disputes', href: '/dashboard/disputes', icon: AlertCircle },
   ];

   const handleLogout = () => {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      router.push('/login');
   };

   return (
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
         {/* Sidebar */}
         <aside className="w-64 bg-slate-900 text-white flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
               <span className="text-xl font-bold tracking-tight text-white">KrishiSetu <span className="text-blue-500">Admin</span></span>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
               {links.map((link) => {
                  const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
                  return (
                     <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                        <link.icon size={18} />
                        {link.name}
                     </Link>
                  );
               })}
            </div>
            <div className="p-4 border-t border-slate-800">
               <div className="mb-4">
                  <p className="text-sm font-medium">{admin.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{admin.role}</p>
               </div>
               <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors w-full">
                  <LogOut size={16} /> Logout
               </button>
            </div>
         </aside>

         {/* Main Content */}
         <main className="flex-1 flex flex-col h-screen overflow-hidden">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
               <h2 className="text-lg font-semibold text-slate-800">Control Panel</h2>
            </header>
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
               {children}
            </div>
         </main>
      </div>
   );
}
